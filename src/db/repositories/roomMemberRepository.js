import { baseRepository } from './baseRepository.js';

export class roomMemberRepository extends baseRepository {
    constructor() {
        super('room_member');
    }

    static async addRoomMember(roomId, userId) {
        const sql = 'insert into room_member (room_id, user_id) values(?,?)';
        const params = [roomId, userId];
        this.query(sql, params);
    }

    static async roomMemberCounts(roomId) {
        const sql = 'select count(*) from room_member where room_id = ?';
        const params = [roomId];
        const data = await this.query(sql, params);
        return data[0][0]['count(*)'];
    }

    static async getRoomMembers(roomId) {
        const sql =
            'select username from users, room_member where users.user_id = room_member.user_id and room_member.room_id = ? order by created_at';
        const params = [roomId];
        const data = await this.query(sql, params);
        return data[0];
    }

    static async exitRoom(userId) {
        const sql = 'delete from room_member where user_id = ?';
        const params = [userId];
        await this.query(sql, params);
    }
}
