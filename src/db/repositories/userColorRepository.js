import { baseRepository } from './baseRepository.js';

class userColorRepository extends baseRepository {
    constructor() {
        super('user_color');
    }

    async insertColor(userId) {
        const sql = 'insert into user_color (user_id) values(?)';
        const param = [userId];
        await this.query(sql, param);
    }

    async updateColor(color, userId) {
        const sql = 'update user_color set color = ? where user_id = ?';
        const param = [color, userId];
        await this.query(sql, param);
    }

    async getColor(userId) {
        const sql = 'select color from user_color where user_id = ?';
        const param = [userId];
        const result = await this.query(sql, param);
        if (result.length == 0) return null;
        return result[0].color;
    }
}

const instance = new userColorRepository();
export default instance;
