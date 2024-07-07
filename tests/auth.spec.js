import request from 'supertest';
import app from '../server.js';
import { capitaliseFirstLetter, generateAccessToken } from '../modules';
import dbClient from '../utils/db.js';
import jwt from 'jsonwebtoken';

describe('Unit Tests', () => {

    const testJWTSecret = "123456789zxcvbnasdfghjkqwertyuio@#$%^&*"

    it('should generate a token with correct expiration time and user details', () => {
        const userId = '1234567890';

        const token = generateAccessToken(userId, testJWTSecret);

        // Decode the token
        const decoded = jwt.verify(token, testJWTSecret);

        expect(decoded).toHaveProperty('userId', userId);
        expect(decoded).toHaveProperty('exp');

        // Check if token expires in roughly 1 hour
        const currentTime = Math.floor(Date.now() / 1000);
        expect(decoded.exp).toBeGreaterThan(currentTime + 3500);
        expect(decoded.exp).toBeLessThan(currentTime + 3700);
    });

});

//It Should Register User Successfully with Default Organisation: Ensure a user is registered successfully when no organisation details are provided.
describe('End-to-End Tests', () => {

    const userData = {
        "firstName": "Simon",
        "lastName": "Ugorji",
        "email": "me@you.com",
        "password": "12345678",
        "phone": "08102990892"
    }

    it('Should capitalise the first letter of a string', () => {

        const string = "octagon"

        const response = capitaliseFirstLetter(string)

        expect(response).toBe("Octagon");
    });

    it('Should register user successfully with default organisation', async () => {

        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Registration successful');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // This checks if it's a JWT token format

        expect(response.body.data).toHaveProperty('organisation', `${capitaliseFirstLetter(userData.firstName)}'s Organisation`);

        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toMatchObject({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone
        });
    });

    it('Should Ensure users can\'t see data from organisations they don\'t have access to.', async () => {

        const response = await request(app)
            .get('/api/organisations/')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('Should Fail if there\'s Duplicate Email or UserID', async () => {

        const response = await request(app)
            .post('/auth/register')
            .send(userData)
            .set('Accept', 'application/json');

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'A user with this email address already exists');
    });

    it('Should Fail If Required Fields Are Missing', async () => {

        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                phone: ""
            })
            .set('Accept', 'application/json');

        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toEqual([
            { field: 'firstName', message: 'firstName is required' },
            { field: 'lastName', message: 'lastName is required' },
            { field: 'email', message: 'email is required' },
            { field: 'password', message: 'password is required' },
            { field: 'phone', message: 'phone is required' }
        ]);
    });

    it('Should Log the user in successfully', async () => {

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // This checks if it's a JWT token format


        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('userId');
        expect(response.body.data.user).toMatchObject({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone
        });
    });

    // Close database connections after tests
    afterAll(async () => {
        await dbClient.end();
    }, 10000); // Increase timeout to 10000 ms (10 seconds)
});