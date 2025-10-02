import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;

export class dbClient {
    constructor() {
        this.pool = null;

        if (process.env.env == 'local') {
            this.pool = mysql.createPool({
                host: process.env.host,
                user: process.env.user,
                password: process.env.password,
                database: process.env.database,
                port: process.env.dbport,
                connectionLimit: 20,
                namedPlaceholders: true,
                charset: 'utf8mb4',
            });
        }
        if (process.env.env == 'production') {
            this.pool = new Pool({
                host: process.env.host,
                user: process.env.user,
                password: process.env.password,
                database: process.env.database,
                port: process.env.dbport || 5432,
                ssl: { rejectUnauthorized: false }, // Supabase は SSL 必須
                max: 20, // connectionLimit 相当
            });
        }
    }

    async query(sql, params) {
        if (process.env.env == 'production') {
            const client = await this.pool.connect();
            const res = await client.query(sql, params);
            return res.rows; // MySQLのrowsに相当
        } else {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        }
    }
}
