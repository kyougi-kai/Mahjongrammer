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
}
