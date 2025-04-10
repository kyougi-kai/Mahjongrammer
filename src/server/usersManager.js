import { usersRepository } from '../db/repositories/usersRepository.js';
const usersrepository = new usersRepository();

export class usersManager {
    constructor() {}

    static async isUserById(userId) {
        return await !usersrepository.isNull('user_id', userId);
    }

    static async isUserByUsername(username) {
        return await !usersrepository.isNull('user_id', username);
    }

    static async addUser(username, password) {
        if (await this.isUserByUsername(username)) {
            return false;
        } else {
            // ユーザーをデータベースに追加
            try {
                await usersrepository.query('insert into users(user_id, username, password) values(uuid(), ?, ?);', [username, password]);
                return true;
            } catch (err) {
                console.error(err);
            }
        }
    }
}
