import { Router } from "express";
import dbClient from "../utils/db.js";
import authenticated from "../middleware/authenticated.js";

//create new router
const userRouter = new Router();

userRouter.use(authenticated, (req, res, next) => {
    try {
        if (req?.user?.userId) {
            return next()
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

// a user gets their own record or user record in organisations they belong to or created -- [PROTECTED].
userRouter.get('/:id', async (req, res) => {
    try {

        //get userId
        const { userId } = req.user

        const { id } = req?.params || {}

        //return data
        let userData = {};

        function formatResponse(data) {
            const result = {};

            data.forEach(entry => {
                const {
                    userid,
                    firstname,
                    lastname,
                    email,
                    phone,
                    orgid,
                    name,
                    description
                } = entry;

                if (!result[userid]) {
                    result[userid] = {
                        userId: userid,
                        firstName: firstname,
                        lastName: lastname,
                        email: email,
                        phone: phone,
                        organisations: []
                    };
                }

                result[userid].organisations.push({
                    orgId: orgid,
                    name: name,
                    description: description
                });
            });

            return Object.values(result)[0];
        }

        //check if id matches the logged in user
        if (id?.toString() === userId?.toString()) {
            //get user from database
            const { rows } = await dbClient.query(`SELECT users.userid, users.firstname, users.lastname, users.email,  users.phone, organisation.orgid, organisation.name, organisation.description FROM users INNER JOIN organisation ON organisation.created_by = users.userid WHERE users.userid = $1`, [userId]);

            if (rows.length > 0) userData = formatResponse(rows);

        } else if (id?.toString() !== "") {

            //get org data from database
            const { rows } = await dbClient.query(`SELECT orgid, name, description FROM organisation WHERE $1 = ANY(users)`, [id]);

            if (rows.length > 0) userData = formatResponse(rows);
        }

        //check if data was returned
        if (!Object.keys(userData)?.length) {
            return res.status(400).json({ error: 'User not found' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data: {
                ...userData
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
})

export default userRouter;