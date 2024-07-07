
import { configDotenv } from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

configDotenv()

const dbClient = new Pool({
    user: process.env?.POSTGRES_USER || 'postgres',
    host: process.env?.POSTGRES_HOST || 'localhost',
    database: process.env?.POSTGRES_DB || null,
    password: process.env?.POSTGRES_PASSWORD || '',
    port: process.env?.POSTGRES_PORT || 5432,
});

dbClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

export default dbClient;