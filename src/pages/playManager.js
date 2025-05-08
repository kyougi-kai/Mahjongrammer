import { connectionManager } from '../ws/connectionManager.js';
import { playClientsManager } from '../ws/playClientsManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';
import { usersManager } from '../server/usersManager.js';
import { roomMemberRepository } from '../db/repositories/roomMemberRepository.js';

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

    _setup() {
        this.wss.onMessage('entryRoom', async (ws, data) => {
            const parentName = data.parentName;
            const username = data.username;
            const parentId = usersManager.nameToId(parentName);
            const ratio = await roomsRepository.getRow('ratio', 'parent_id', parentId);
            const roomId = await roomsRepository.getRoomId(parentId);
            const userId = usersManager.nameToId(username);

            // 割合送信
            ws.send(
                JSON.stringify({
                    type: 'getRatio',
                    payload: {
                        ratio: JSON.parse(ratio),
                    },
                })
            );

            // playClientsに保存
            this.playclientsmanager.entryRoom(roomId, username);

            // room_member に追加
            roomMemberRepository.addRoomMember(roomId, userId);
        });

        this.wss.onMessage('outRoom', async (ws, data) => {
            const username = data.username;
            const userId = await usersManager.nameToId(username);
            const parentName = data.parentName;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await roomsRepository.getRoomId(parentId);

            if (username == parentName) {
                await roomsRepository.deleteRoom(roomId);
            } else {
                await roomMemberRepository.exitRoom(userId);
                const roomMemberCounts = await roomMemberRepository.getRoomMembers(roomId);
                this.roommanager.noticeOutRoom(parentName, roomMemberCounts);
                this.playclientsmanager.sendRoomData(roomId);
            }
        });
    }
}
