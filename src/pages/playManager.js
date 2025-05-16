import { connectionManager } from '../ws/connectionManager.js';
import { playClientsManager } from '../ws/playClientsManager.js';
import { usersManager } from '../server/usersManager.js';
import roomMemberDB from '../db/repositories/roomMemberRepository.js';
import roomsDB from '../db/repositories/roomsRepository.js';

export class playManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss, roommanager) {
        this.wss = wss;
        this.playclientsmanager = new playClientsManager(wss);
        this.roommanager = roommanager;

        this._setup();
    }

    async onMessageEntryRoom(ws, data) {
        const parentName = data.parentName;
        const username = data.username;
        const parentId = await usersManager.nameToId(parentName);
        const ratio = await roomsDB.getRow('ratio', 'parent_id', parentId);
        const roomId = await roomsDB.getRoomId(parentId);
        const userId = await usersManager.nameToId(username);
        const roomMembersData = await roomMemberDB.getRoomMembers(roomId);

        // 割合送信
        ws.send(
            JSON.stringify({
                type: 'getRoomMemberData',
                payload: {
                    ratio: JSON.parse(ratio),
                    roomMembers: roomMembersData,
                },
            })
        );

        // playClientsに保存
        this.playclientsmanager.entryRoom(roomId, username);

        // room_member に追加
        await roomMemberDB.addRoomMember(roomId, userId);

        const roomMemberCounts = await roomMemberDB.roomMemberCounts(roomId);
        this.roommanager.noticeEntryRoom(parentName, roomMemberCounts);
    }

    _setup() {
        this.wss.onMessage('entryRoom', async (ws, data) => this.onMessageEntryRoom(ws, data), 1);

        this.wss.onMessage('outRoom', async (ws, data) => {
            const username = data.username;
            const userId = await usersManager.nameToId(username);
            const parentName = data.parentName;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await roomsDB.getRoomId(parentId);

            if (username == parentName) {
                await roomsDB.deleteRoom(roomId);
            } else {
                await roomMemberDB.exitRoom(userId);
                const roomMemberCounts = await roomMemberDB.getRoomMembers(roomId);
                this.roommanager.noticeOutRoom(parentName, roomMemberCounts);
                this.playclientsmanager.sendRoomData(roomId);
            }
        });
    }
}
