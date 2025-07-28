import { connectionManager } from '../ws/connectionManager.js';
import { roomClientsManager } from '../ws/roomClientsManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';
const roomsrepository = new roomsRepository();

export class roomManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.wss = wss;
        this.roomclientsmanager = new roomClientsManager(this.wss);

        // ルームテーブル初期化
        roomsrepository.initializeTable();

        this._setup();
    }

    _setup() {
        this.wss.onMessage('requestRoomData', async (ws, data) => {
            const roomData = await roomsrepository.getRoomMemberCountData();
            ws.send(JSON.stringify({ type: 'getRoomData', payload: roomData }));
        });

        this.wss.onMessage('createRoom', async (ws, data) => {
            const userId = data.userId;
            await roomsrepository.createRoom(userId, data.roomName, data.ratio);
            const roomId = await roomsrepository.getRoomId(userId);
            this.roomclientsmanager.roomC.values().forEach((client) => {
                const sendData = {
                    type: 'getRoomData',
                    payload: {
                        roomName: data.roomName,
                        roomId: roomId,
                        room_member_counts: 0,
                    },
                };
                const stringSendData = JSON.stringify(sendData);
                client.send(stringSendData);
            });
        });
    }

    noticeEntryRoom(roomId, roomMemberCounts) {
        this.roomclientsmanager.roomC.forEach((client) => {
            const sendData = {
                type: 'changeRoomData',
                payload: {
                    roomId: roomId,
                    roomMemberCounts: roomMemberCounts,
                },
            };

            client.send(JSON.stringify(sendData));
        });
    }

    noticeOutRoom(roomId, roomMemberCounts) {
        this.roomclientsmanager.noticeOutRoom(roomId, roomMemberCounts);
    }

    noticeDeleteRoom(roomId) {
        this.roomclientsmanager.noticeDeleteRoom(roomId);
    }

    static async isRoomByParentId(parentId) {
        return (await roomsrepository.isNull('parent_id', parentId)) == false;
    }

    static async isRoomByRoomId(roomId) {
        return (await roomsrepository.isNull('room_id', roomId)) == false;
    }
}
