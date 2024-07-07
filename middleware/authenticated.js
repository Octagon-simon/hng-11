import jwt from "jsonwebtoken";

import dbClient from "../utils/db.js";

export default async (req, res, next) => {
    try {

        //get the token from request header
        const token = req.headers.authorization?.split(' ')[1];

        //verify the token
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        //check if userId is present
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        //check if userId exists
        const { rows } = await dbClient.query('SELECT * FROM users WHERE userId = $1 LIMIT 1', [userId]);

        if (!rows?.length) return res.status(401).json({ message: "Unauthorized" });

        //add user id to request object
        req.user = { userId }

        return next();

    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Unauthorized" });
        }

        return res.status(500).json({ error: "Server error" });
    }
}
