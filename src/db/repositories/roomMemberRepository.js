import { baseRepository } from './baseRepository.js';

export class roomMemberRepository extends baseRepository {
    constructor() {
        super('room_member');
    }

    async addRoomMember(roomId, userId) {
        const sql = 'insert into room_member (room_id, user_id) values(?,?)';
        const params = [roomId, userId];
        await this.query(sql, params);
    }

    async roomMemberCounts(roomId) {
        const sql = 'select room_id, count(*) from room_member where room_id = ? group by room_id';
        const params = [roomId];
        const data = await this.query(sql, params);
        return data[0]['count(*)'];
    }

    async getRoomMembers(roomId) {
        const sql =
            'select username, room_member.user_id, isReady from users, room_member where users.user_id = room_member.user_id and room_member.room_id = ? order by created_at';
        const params = [roomId];
        const data = await this.query(sql, params);
        return data;
    }

    async exitRoom(userId) {
        const sql = 'delete from room_member where user_id = ?';
        const params = [userId];
        await this.query(sql, params);
    }

    async updateIsReady(userId, isReady) {
        const sql = 'update room_member set isReady = ? where user_id = ?';
        const params = [isReady, userId];
        await this.query(sql, params);
    }
}

const instance = new roomMemberRepository();
export default instance;
