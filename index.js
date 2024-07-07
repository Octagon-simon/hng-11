import express, { json } from 'express';
import dbClient from './utils/db.js';
import Octavalidate from 'octavalidate-nodejs';
import { generateUID, hashPassword, formatErrors } from './modules/index.js';
import authRouter from './controllers/auth.js';
import userRouter from './controllers/users.js';
import orgRouter from './controllers/orgs.js';

const app = express();
app.use(json())

//set port number
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

//register authentication routes
app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/organisations', orgRouter);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));