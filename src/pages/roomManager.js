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
            this.roomclientsmanager.roomC.values().forEach((client) => {
                const sendData = {
                    type: 'getRoomData',
                    payload: {
                        username: data.roomName,
                        room_member_counts: 0,
                    },
                };
                const stringSendData = JSON.stringify(sendData);
                client.send(stringSendData);
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
        this.roomclientsmanager.roomC.forEach((client) => {
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

    static async isRoomByParentId(parentId) {
        return (await roomsrepository.isNull('parent_id', parentId)) == false;
    }
}
