import mysql from 'mysql2/promise';
import postgres from 'postgres';

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
            this.pool = postgres(process.env.DATABASE_URL);
        }
    }

    async query(sql, params) {
        if (process.env.env == 'production') {
            let index = 1;
            const sqlConverted = sql.replace(/\?/g, () => `$${index++}`);
            return await this.pool.unsafe(sqlConverted, params);
        } else {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        }
    }
}
