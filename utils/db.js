
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

//source https://github.com/brianc/node-postgres/issues/2034#issuecomment-567844667
// pool.connect((err, client) => {
//   if (err) {
//     logger.error(`Can not connect to postgres at host ${connectionString}, ${err.stack}`);
//   } else {
//     logger.info(`Postgres connected to host: '${connectionString}'`);
//     client.release();
//   }
// });

dbClient.connect()
    .then((client) => {
        console.log('Connected to the PostgreSQL database.');
        client.release();
    })
    .catch(err => console.error('Connection error', err.stack));

// await new Promise((resolve, reject) => setTimeout(resolve, 3000));

// dbClient.end()
//     .then(() => console.log('connection closed'))
//     .catch(err => console.error('Connection error', err.stack));

export default dbClient;