import { dbClient } from '../dbClient.js';
const db = new dbClient();

export class baseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    initializeTable() {
        db.query(`delete from ${this.tableName}`, []);
    }

    async getRow(fieldName, filterName, filterValue) {
        const sql = `select ${fieldName} from ${this.tableName} where ${filterName} = ?`;
        const params = [filterValue];
        const result = await db.query(sql, params);
        return result[0][fieldName];
    }

    /**
     *
     * @param {*} filterName -配列でもいいよ-
     * @param {*} filterValue -配列でもいいよ-
     * @returns true/false
     */
    async isNull(filterName, filterValue) {
        let sql;
        let params;
        if (Array.isArray(filterName)) {
            let filters = filterName.map((fName) => `${fName} = ?`);
            sql = `select count(*) from ${this.tableName} where ${filters.join(' and ')}`;
            params = filterValue;
        } else {
            sql = `select count(*) from ${this.tableName} where ${filterName} = ?`;
            params = [filterValue];
        }
        const result = await db.query(sql, params);
        return result[0]['count(*)'] == 0;
    }

    /**
     *
     * @param {Object} data -オブジェクト型で追加したい値を設定-
     * {username:'ei', password:'hi'}
     */
    async insert(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `insert into ${this.tableName} (${keys.join(', ')}) values (${placeholders})`;
        await db.query(sql, values);
    }

    async delete(filterName, filterValue) {
        const sql = `delete from ${this.tableName} where ${filterName} = ?`;
        const params = [filterValue];
        await db.query(sql, params);
    }

    async query(sql, params) {
        const result = await db.query(sql, params);
        return result;
    }
}
