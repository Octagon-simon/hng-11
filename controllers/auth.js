import { Router } from "express";
import Octavalidate from "octavalidate-nodejs";
import { capitaliseFirstLetter, comparePasswords, formatErrors, generateAccessToken, generateUID, hashPassword } from "../modules/index.js";
import dbClient from "../utils/db.js";

const authRouter = new Router();

const JWT_SECRET = process.env.JWT_SECRET;

//utility to create organisation
const createOrganisation = async ({ firstName, userId }) => {

    //create organisation name
    const orgName = `${capitaliseFirstLetter(firstName)}'s Organisation`;

    //generate organisationId
    const orgId = generateUID(userId);

    return dbClient.query('INSERT INTO organisation (orgid, name, created_by, users) VALUES ($1, $2, $3, $4) RETURNING *', [orgId, orgName, userId, [userId]]);
}

// Create user
authRouter.post('/register', async (req, res) => {
    try {
        //initiate validation lib
        const octavalidate = new Octavalidate('register');

        const { createValidator, getErrors, validate } = octavalidate;

        //create validation rules
        const rules = {
            firstName: {
                type: "string",
                required: true,
                // maxLength: 50,
                // ruleTitle: "alphaOnly"
            },
            lastName: {
                type: "string",
                required: true,
                // maxLength: 50,
                // ruleTitle: "alphaOnly"
            },
            email: {
                type: "string",
                required: true,
                // maxLength: 50,
                ruleTitle: "email"
            },
            password: {
                type: "string",
                required: true,
                // minLength: 8,
            },
            phone: {
                // type: "number",
                required: true,
                // maxLength: 14,
                // ruleTitle: "digitsOnly"
            }
        }

        //create validator
        createValidator(rules)

        //validate the request body
        if (!validate(req?.body || {})) {
            return res.status(422).json({
                errors: formatErrors(getErrors())
            })
        }

        //desctructure payload
        const { firstName, lastName, email, password, phone } = req.body

        //generate userId for this user, use the email to make it unique and the hash the same
        const userId = generateUID(email);

        const hashedPassword = await hashPassword(password);

        //check if user is registered already
        const { rows } = await dbClient.query('SELECT * FROM users WHERE email = $1 OR phone = $2 LIMIT 1', [email, phone]);

        if (rows?.length) {
            return res.status(409).json({ error: 'A user with this email address already exists' });
        }

        //insert user into the database
        const userCreated = await dbClient.query('INSERT INTO users (userId, firstName, lastName, email, password, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [userId, firstName, lastName, email, hashedPassword, phone]);

        //create organisation for this user
        const orgCreated = await createOrganisation({ firstName, userId });

        //check if records were created
        if (userCreated?.rows?.length && orgCreated?.rows?.length) {
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                data: {
                    accessToken: generateAccessToken(userId, JWT_SECRET),
                    organisation: orgCreated.rows[0].name,
                    user: {
                        userId,
                        firstName,
                        lastName,
                        email,
                        phone,
                    }
                }
            });
        }

        //return failure message
        return res.status(400).json({
            status: 'Bad request',
            message: 'Registration unsuccessful',
            statusCode: 400
        })

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

//login user
authRouter.post('/login', async (req, res) => {
    try {
        //initiate validation lib
        const octavalidate = new Octavalidate('login');

        const { createValidator, getErrors, validate } = octavalidate;

        //create validation rules
        const rules = {
            email: {
                type: "string",
                required: true,
                ruleTitle: "email"
            },
            password: {
                type: "string",
                required: true,
            }
        }

        //create validator
        createValidator(rules)

        //validate the request body
        if (!validate(req?.body || {})) {
            return res.status(422).json({
                errors: formatErrors(getErrors())
            })
        }

        //desctructure payload
        const { email, password } = req.body

        //get record from the database
        const { rows } = await dbClient.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);

        if (!rows?.length) {
            return res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401
            });
        }

        const user = rows[0];

        //check password
        const isValidPassword = await comparePasswords(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401
            });
        }

        //generate token
        const token = generateAccessToken(user.userid, JWT_SECRET)

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken: token,
                user: {
                    userId: user.userid,
                    firstName: user.firstname,
                    lastName: user.lastname,
                    email: user.email,
                    phone: user.phone,
                }
            }
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
})

export default authRouter;