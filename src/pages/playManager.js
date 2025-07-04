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
        this.roommanager.noticeEntryRoom(roomId, roomMembersData.length);
    }

    _setup() {
        this.wss.onMessage('startGame', async (ws, data) => {
            const parentId = await usersManager.nameToId(data.parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            const sendData = {
                type: 'startGame',
                payload: {},
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('next', async (ws, data) => {
            const parentId = await usersManager.nameToId(data.parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            const sendData = {
                type: 'nextPhase',
                payload: {},
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('skip', async (ws, data) => {
            const parentId = await usersManager.nameToId(data.parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            this.playclientsmanager.playC[roomId].skip++;
            const roomMemberCounts = await roomMemberDB.roomMemberCounts(roomId);
            if (this.playclientsmanager.playC[roomId].skip == roomMemberCounts - 1) {
                const sendData = {
                    type: 'nextPhase',
                    payload: {},
                };
                this.sendToClients(sendData, roomId);
                this.playclientsmanager.playC[roomId].skip = 0;
            }
        });

        this.wss.onMessage('pon', async (ws, data) => {
            const parentId = await usersManager.nameToId(data.parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            const sendData = {
                type: 'pon',
                payload: { ponPlayerNumber: data.playerNumber },
            };
            this.playclientsmanager.playC[roomId].skip = 0;
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('nextRound', async (ws, data) => {
            const roomId = data.roomId;
            this.playclientsmanager.playC[roomId].nextRound++;
            const roomMemberCounts = await roomMemberDB.roomMemberCounts(roomId);
            if (this.playclientsmanager.playC[roomId].nextRound == roomMemberCounts) {
                const sendData = {
                    type: 'reStart',
                    payload: { tumoPlayerNumber: data.playerNumber },
                };
                this.sendToClients(sendData, roomId);
            }
        });

        this.wss.onMessage('throwHai', async (ws, data) => {
            const parentId = await usersManager.nameToId(data.parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            const sendData = {
                type: 'throwHai',
                payload: { hai: data.hai },
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('tumo', async (ws, data) => {
            const roomId = data.roomId;
            const sendData = {
                type: 'tumo',
                payload: {
                    grammerData: data.grammerData,
                    tumoPlayerNumber: data.playerNumber,
                },
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('entryRoom', async (ws, data) => this.onMessageEntryRoom(ws, data), 1);

        setTimeout(() => {
            routemanager.onPost('outRoom', async (data) => {
                console.log('誰か退出したよ');
                const payload = data;
                console.log(payload);

                const username = payload.username;

                try {
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
                        this.roommanager.noticeDeleteRoom(roomId);
                    } else {
                        await roomMemberDB.exitRoom(userId);
                        const roomMemberCounts = await roomMemberDB.roomMemberCounts(roomId);
                        console.log('getRoomMemberCounts');
                        console.log(roomMemberCounts);
                        this.roommanager.noticeOutRoom(roomId, roomMemberCounts);

                        const sendData = {
                            type: 'outRoom',
                            payload: {
                                username: username,
                            },
                        };
                        this.sendToClients(sendData, roomId);
                    }
                } catch (err) {
                    console.log('playerManager.js');
                    console.log('部屋が存在しません');
                }
            });
        }, 1000);
    }

    sendToClients(sendData, roomId) {
        if (!this.playclientsmanager.playC.hasOwnProperty(roomId)) return;
        Object.values(this.playclientsmanager.playC[roomId]).forEach((client, index) => {
            if (index == 0 || index == 1) return;
            client.send(JSON.stringify(sendData));
        });
    }
}
