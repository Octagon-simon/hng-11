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

        //get user from database
        const { rows: userData } = await dbClient.query(`SELECT * FROM users WHERE userid = $1 LIMIT 1`, [userId]);

        //check if data was returned
        if (!userData?.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data: {
                userId: userData[0].userid,
                firstName: userData[0].firstname,
                lastName: userData[0].lastname,
                email: userData[0].email,
                phone: userData[0].phone,
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
})

export default userRouter;