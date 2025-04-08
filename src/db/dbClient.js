import mysql from 'mysql2/promise';

export class dbClient {
    constructor() {
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

    async query(sql, params) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }
}
