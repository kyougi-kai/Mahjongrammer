import { connectionManager } from '../ws/connectionManager.js';
import { playClientsManager } from '../ws/playClientsManager.js';
import { usersManager } from '../server/usersManager.js';
import roomMemberDB from '../db/repositories/roomMemberRepository.js';
import roomsDB from '../db/repositories/roomsRepository.js';
import { routemanager } from '../app.js';

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

        let roomMembersData = await roomMemberDB.getRoomMembers(roomId);
        roomMembersData = roomMembersData.map((value) => value.username);
        roomMembersData.push(username);

        // room_member に追加
        await roomMemberDB.addRoomMember(roomId, userId);

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

        const sendData = {
            type: 'entryRoom',
            payload: {
                username: username,
            },
        };
        this.sendToClients(sendData, roomId);

        // playClientsに保存
        this.playclientsmanager.entryRoom(roomId, username, ws);
        this.roommanager.noticeEntryRoom(parentName, roomMembersData.length);
    }

    _setup() {
        this.wss.onMessage('entryRoom', async (ws, data) => this.onMessageEntryRoom(ws, data), 1);

        setTimeout(() => {
            routemanager.onPost('/disconnect-log', async (req, res) => {
            console.log('誰か退出したよ');
            console.log(req);
            console.log(req.body);
            const { type, payload} = req.body;
            console.log(payload);

            const username = payload.username;
            const userId = await usersManager.nameToId(username);
            const parentName = payload.parentName;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await roomsDB.getRoomId(parentId);

            if (username == parentName) {
                await roomsDB.deleteRoom(roomId);

                const sendData = {
                    type: 'closeRoom',
                    payload: {},
                };

                this.sendToClients(sendData, roomId);
            } else {
                await roomMemberDB.exitRoom(userId);
                const roomMemberCounts = await roomMemberDB.getRoomMembers(roomId);
                this.roommanager.noticeOutRoom(parentName, roomMemberCounts);

                const sendData = {
                    type: 'outRoom',
                    payload: {
                        username: username,
                    },
                };
                this.sendToClients(sendData, roomId);

                this.playclientsmanager.sendRoomData(roomId);
            }
        });
        }, 1000);
    }

    sendToClients(sendData, roomId) {
        if (!this.playclientsmanager.playC.hasOwnProperty(roomId)) return;
        Object.values(this.playclientsmanager.playC[roomId]).forEach((client, index) => {
            if (index == 0) return;
            client.send(JSON.stringify(sendData));
        });
    }
}
