import express, { json } from 'express';
import authRouter from './controllers/auth.js';
import userRouter from './controllers/users.js';
import orgRouter from './controllers/orgs.js';

const app = express();

//parse JSON request bodies
app.use(json())

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

//register authentication routes
app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/organisations', orgRouter);

export default app;