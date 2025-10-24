import { Pool } from 'pg';

let pool: Pool;

if (!global._databasePool) {
  global._databasePool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
  });
}
pool = global._databasePool;

export default pool;

declare global {
  var _databasePool: Pool;
}

