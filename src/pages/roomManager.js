import { connectionManager } from '../ws/connectionManager.js';
import { roomClientsManager } from '../ws/roomClientsManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';
import { usersManager } from '../server/usersManager.js';

export class roomManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.wss = wss;
        this.roomclientsmanager = new roomClientsManager(this.wss);
        this.roomsrepository = new roomsRepository();

        // ルームテーブル初期化
        this.roomsrepository.initializeTable();

        this._setup();
    }

    _setup() {
        this.wss.onGet('/room', async (ws) => {
            const roomData = await this.roomsrepository.getRoomMemberCountData();
            ws.send(JSON.stringify({ type: 'getRoomData', payload: roomData }));
        });

        this.wss.onMessage('createRoom', async (ws, data) => {
            const userId = await usersManager.nameToId(data.roomName);
            await this.roomsrepository.createRoom(userId, data.ratio);
            this.roomclientsmanager.roomClients.forEach((client) => {
                const sendData = {
                    type: 'getRoomData',
                    payload: {
                        username: data.roomName,
                        room_member_counts: 0,
                    },
                };
                client.send(sendData);
            });
        });

        this.wss.onMessage('entryRoom', async (ws, data) => {
            const parentId = usersManager.nameToId(parentName);
            const roomId = await roomsRepository.getRoomId(parentId);
            const roomMemberCounts = await roomMemberRepository.roomMemberCounts(roomId);
            this.noticeEntryRoom(data.parentName, roomMemberCounts);
        });
    }

    noticeEntryRoom(roomName, roomMemberCounts) {
        this.roomclientsmanager.roomClients.forEach((client) => {
            const sendData = {
                type: 'changeRoomData',
                payload: {
                    roomName: roomName,
                    roomMemberCounts: roomMemberCounts,
                },
            };

            client.send(JSON.stringify(sendData));
        });
    }

    noticeOutRoom(roomName, roomMemberCounts) {
        this.roomclientsmanager.noticeOutRoom(roomName, roomMemberCounts);
    }
}
