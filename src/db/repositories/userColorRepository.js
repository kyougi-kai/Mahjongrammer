import { baseRepository } from './baseRepository.js';

export class userColorRepository extends baseRepository {
    constructor() {
        super('user_color');
    }

    async insertColor(userId) {
        const sql = 'insert into user_color (user_id) values(?)';
        const param = [userId];
        await this.query(sql, param);
    }
}

const instance = new userColorRepository();
export default instance;