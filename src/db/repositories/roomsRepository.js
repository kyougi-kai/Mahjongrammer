import { baseRepository } from './baseRepository.js';

export class roomsRepository extends baseRepository {
    constructor() {
        super('rooms');
    }

    async getRoomMemberCountData() {
        const sql =
            'select username, count(*) as room_member_counts from users, rooms, room_member where users.user_id = rooms.parent_id and rooms.room_id = room_member.room_id group by username';
        const data = await this.query(sql, []);
        return data;
    }

    async createRoom(parentId, ratio) {
        const sql = 'insert into rooms (parent_id, ratio) values(?, ?)';
        const param = [parentId, ratio];
        await this.query(sql, []);
    }

    static async getRoomId(parentId) {
        const result = this.getRow('room_id', 'parent_id', parentId);
        return result;
    }

    static async deleteRoom(roomId) {
        this.query('delete from rooms where room_id = ?', [roomId]);
    }
}
