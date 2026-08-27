import { Pool } from "pg";

const db = new Pool(
    {
        user: 'postgres',
        password: 'root',
        host: '127.0.0.1',
        port: 5432,
        database: 'ecommapi2'
    }
);

export default db;