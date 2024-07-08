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

        //check if id matches the logged in user
        if (id?.toString() === userId?.toString()) {
            //get user from database
            const { rows } = await dbClient.query(`SELECT userid, firstname, lastname, email, phone FROM users WHERE userid = $1 LIMIT 1`, [userId]);

            if (rows.length > 0) userData = rows[0];

        } else if (id?.toString() !== "") {

            //get org data from database
            const { rows } = await dbClient.query(`SELECT orgid, name, description FROM organisation WHERE $1 = ANY(users) LIMIT 1`, [id]);

            if (rows.length > 0) userData = rows[0];
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