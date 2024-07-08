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
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/organisations', orgRouter);

/// 404 ERROR
app.use((req, res) => {
    return res.status(404).json({
        error: "Route not found",
    });
});


export default app;