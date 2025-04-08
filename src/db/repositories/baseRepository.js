import { dbClient } from '../dbClient.js';
const db = new dbClient();

export class baseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async getRow(fieldName, filterName, filterValue) {
        const sql = `select ${fieldName} from ${this.tableName} where ${filterName} = ?`;
        const params = [filterValue];
        const result = await db.query(sql, params);
        return result[0][fieldName];
    }

    async isNull(filterName, filterValue) {
        const sql = `select count(*) from ${this.tableName} where ${filterName} = ?`;
        const params = [filterValue];
        console.log(sql);
        console.log(params);
        const result = await db.query(sql, params);
        return result[0]['count(*)'] == 0;
    }
}
