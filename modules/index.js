import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
configDotenv()

function formatErrors(input) {
    const errors = [];

    // Iterate over each key in the input object
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const fields = input[key];
            for (const field in fields) {
                if (fields.hasOwnProperty(field)) {
                    const fieldMessages = fields[field];
                    // Get the first value (message) from the field object
                    const message = Object.values(fieldMessages)[0];
                    errors.push({ field, message });
                }
            }
        }
    }

    return errors;
}


function generateUID(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

const generateAccessToken = (userId, secret) => {
    const payload = { userId };
    const options = { expiresIn: '1h' }; // Token expires in 1 hour

    return jwt.sign(payload, secret, options);
};

// Function to hash a password
async function hashPassword(password) {
    const saltRounds = 10; // Number of salt rounds to use
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
    }
}

// Function to compare a password with a hash
async function comparePasswords(password, hashedPassword) {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (err) {
        console.error('Error comparing passwords:', err);
    }
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export {
    capitaliseFirstLetter,
    formatErrors,
    generateUID,
    generateAccessToken,
    hashPassword,
    comparePasswords,
}