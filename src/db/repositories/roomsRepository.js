import { baseRepository } from './baseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export class roomsRepository extends baseRepository {
    constructor() {
        super('rooms');
    }

    async getRoomMemberCountData() {
        const sql =
            'select username, room_name, rooms.room_id, count(*) as room_member_counts from users, rooms, room_member where users.user_id = rooms.parent_id and rooms.room_id = room_member.room_id group by username, rooms.room_id';
        const data = await this.query(sql, []);
        return data;
    }

    async createRoom(parentId, roomName, ratio) {
        const roomId = uuidv4(); // Generate UUID beforehand
        const sql = 'insert into rooms (room_id, room_name, parent_id, ratio) values(?, ?, ?, ?)';
        const param = [roomId, roomName, parentId, JSON.stringify(ratio)];
        await this.query(sql, param);
    }

    async getRoomId(parentId) {
        const result = super.getRow('room_id', 'parent_id', parentId);
        return result;
    }

    async deleteRoom(roomId) {
        this.query('delete from rooms where room_id = ?', [roomId]);
    }
}

const instance = new roomsRepository();
export default instance;
