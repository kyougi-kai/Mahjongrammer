import { connectionManager } from '../ws/connectionManager.js';
import { roomClientsManager } from '../ws/roomClientsManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';
import { usersManager } from '../server/usersManager.js';
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
        this.wss.onGet('/room', async (ws) => {
            const roomData = await roomsrepository.getRoomMemberCountData();
            ws.send(JSON.stringify({ type: 'getRoomData', payload: roomData }));
        });

        this.wss.onMessage('createRoom', async (ws, data) => {
            const userId = await usersManager.nameToId(data.roomName);
            await roomsrepository.createRoom(userId, data.ratio);
            const roomId = await roomsrepository.getRoomId(userId);
            console.log(`${data.roomName}が部屋を作成しました`);
            this.roomclientsmanager.roomC.values().forEach((client) => {
                const sendData = {
                    type: 'getRoomData',
                    payload: {
                        username: data.roomName,
                        roomId: roomId,
                        room_member_counts: 0,
                    },
                };
                const stringSendData = JSON.stringify(sendData);
                client.send(stringSendData);
            });
        });
    }

    noticeEntryRoom(roomName, roomId, roomMemberCounts) {
        this.roomclientsmanager.roomC.forEach((client) => {
            const sendData = {
                type: 'changeRoomData',
                payload: {
                    roomName: roomName,
                    roomId: roomId,
                    roomMemberCounts: roomMemberCounts,
                },
            };

            client.send(JSON.stringify(sendData));
        });
    }

    noticeOutRoom(roomName, roomMemberCounts) {
        this.roomclientsmanager.noticeOutRoom(roomName, roomMemberCounts);
    }

    noticeDeleteRoom(roomName) {
        this.roomclientsmanager.noticeDeleteRoom(roomName);
    }

    static async isRoomByParentId(parentId) {
        return (await roomsrepository.isNull('parent_id', parentId)) == false;
    }
}
