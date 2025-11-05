import { usersRepository } from '../db/repositories/usersRepository.js';
import { v4 as uuidv4 } from 'uuid';

const usersrepository = new usersRepository();

export class usersManager {
    constructor() {}

    static async isUserById(userId) {
        return await !usersrepository.isNull('user_id', userId);
    }

    static async isUserByUsername(username) {
        return await !usersrepository.isNull('username', username);
    }

    static async addUser(username, password) {
        if (await this.isUserByUsername(username)) {
            return false;
        } else {
            // ユーザーをデータベースに追加
            try {
                const userId = uuidv4(); // Generate UUID beforehand
                await usersrepository.query('insert into users(user_id, username, password) values(?, ?, ?);', [userId, username, password]);
                return true;
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async nameToId(username) {
        return await usersrepository.getRow('user_id', 'username', username);
    }

    static async idToName(userId) {
        return await usersrepository.getRow('username', 'user_id', userId);
    }

    static async loginCheck(username, password) {
        return (await usersrepository.isNull(['username', 'password'], [username, password])) == false;
    }

    static async isLogin(req, res) {
        const userId = req.cookies.userId;
        if (userId === undefined) res.render('pages/index');
    }

    static async deleteUser(userId) {
        await usersrepository.delete('user_id', userId);
    }
}
