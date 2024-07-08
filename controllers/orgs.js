import { Router } from "express";
import dbClient from "../utils/db.js";
import authenticated from "../middleware/authenticated.js";
import Octavalidate from "octavalidate-nodejs";
import { capitaliseFirstLetter, formatErrors, generateUID } from "../modules/index.js";

//create new router
const orgRouter = new Router();

// gets all your organisations the user belongs to or created. If a user is logged in properly, they can get all their organisations. They should not get another user’s organisation  -- [PROTECTED].
orgRouter.get('/', authenticated, async (req, res) => {
    try {

        if (!req?.user?.userId) return res.status(401).json({ message: "Unauthorized" });

        //get userId
        const { userId } = req.user;

        //get user from database
        const { rows: orgData } = await dbClient.query(`SELECT orgid, name, description FROM organisation WHERE $1 = ANY(users);`, [userId]);

        //check if data was returned
        if (!orgData?.length) {
            return res.status(404).json({ error: 'This user has not created or does not belong to any organisation' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Organisations retrieved successfully',
            data: {
                organisations: orgData
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//the logged in user gets a single organisation record -- [PROTECTED]
orgRouter.get('/:orgId', authenticated, async (req, res) => {
    try {

        if (!req?.user?.userId) return res.status(401).json({ message: "Unauthorized" });

        //get userId
        const { userId } = req.user;

        //get orgId
        const { orgId } = req?.params || {};

        if (!orgId) return res.status(400).json({
            message: "Organisation ID is required"
        })

        //get user from database
        const { rows: orgData } = await dbClient.query(`SELECT * FROM organisation WHERE orgid = $1 AND created_by = $2 LIMIT 1`, [orgId, userId]);

        //check if data was returned
        if (!orgData?.length) {
            return res.status(404).json({ error: 'Organisation not found' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Organisation retrieved successfully',
            data: {
                orgId: orgData[0].orgid,
                name: orgData[0].name,
                description: orgData[0].description,
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//a user can create their new organisation  --done --[PROTECTED]
orgRouter.post('/', authenticated, async (req, res) => {
    try {

        if (!req?.user?.userId) return res.status(401).json({ message: "Unauthorized" });

        //get userId
        const { userId } = req.user;

        //init validation lib
        const octavalidate = new Octavalidate('organisations');

        //destructure methods
        const { createValidator, getErrors, validate } = octavalidate;

        //create validation rules
        const rules = {
            name: {
                type: "string",
                required: true,
                ruleTitle: 'alphaOnly'
            },
            description: {
                type: "string",
                required: true,
                ruleTitle: "generalText"
            }
        }

        //create validation rules
        createValidator(rules);

        //validate the request body
        if (!validate(req?.body || {})) {
            return res.status(422).json({
                errors: formatErrors(getErrors())
            })
        }

        //destructure request body
        const { name, description } = req.body;

        //create organisation name
        const orgName = `${capitaliseFirstLetter(name)}'s Organisation`;

        //generate organisationId
        const orgId = generateUID(userId);

        const { rows: newOrgData } = await dbClient.query('INSERT INTO organisation (orgid, name, description, created_by, users) VALUES ($1, $2, $3, $4, $5) RETURNING *', [orgId, orgName, description, userId, [userId]]);

        //check if data was returned
        if (!newOrgData?.length) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Client error",
                statusCode: 400
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Organisation created successfully',
            data: {
                orgId: newOrgData[0].orgid,
                name,
                description
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//adds a user to a particular organisation --done --[NOT PROTECTED]
orgRouter.post('/:orgId/users', async (req, res) => {
    try {

        //get orgId
        const { orgId } = req?.params || {};

        //get userId
        const { userId } = req?.body || {};

        if (!(orgId && userId)) return res.status(400).json({
            message: "Organisation ID & UserId are required"
        })

        //retrieve organisation
        const { rows: orgData } = await dbClient.query(`SELECT * FROM organisation WHERE orgid = $1 LIMIT 1`, [orgId])

        //check if data was returned
        if (!orgData?.length) {
            return res.status(404).json({ error: 'Organisation not found' });
        }

        //check if user exists already in this organisation
        if ([...orgData?.[0].users].includes(userId)) {
            return res.status(422).json({
                message: "User already exists in this organisation"
            })
        }

        //check if userId is valid
        const {rows: userData} = await dbClient.query(`SELECT * FROM users WHERE userid = $1 LIMIT 1`, [userId])

        if(!userData?.length){
            return res.status(400).json({ message: 'User not found' });
        }

        //add user to users list
        const newUser = [...orgData?.[0].users || [], userId]

        //update the organisation in the database
        const { rows: updatedOrgData } = await dbClient.query(`UPDATE organisation SET users = $1 WHERE orgid = $2 RETURNING *`, [newUser, orgId])

        //check if data was returned
        if (!updatedOrgData?.length) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Client error",
                statusCode: 400
            });
        }

        return res.status(200).json({
            status: "success",
            message: "User added to organisation successfully",
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})


export default orgRouter;