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
        const roomId = data.roomId;
        const userId = data.userId;
        // const ratio = await roomsDB.getRow('ratio', 'room_id', roomId);

        // room_member に追加
        const isPlayer = await roomMemberDB.isNull('user_id', userId);
        if (isPlayer) await roomMemberDB.addRoomMember(roomId, userId);

        let roomMembersData = await roomMemberDB.getRoomMembers(roomId);

        // 割合送信
        console.log('roomMembersData:', roomMembersData);
        ws.send(
            JSON.stringify({
                type: 'getRoomMemberData',
                payload: {
                    // ratio: JSON.parse(ratio),
                    roomMembers: roomMembersData,
                },
            })
        );
        // playClientsに保存
        this.playclientsmanager.entryRoom(roomId, userId, ws);
        if (isPlayer) {
            const username = await usersManager.idToName(userId);
            const sendData = {
                type: 'entryRoom',
                payload: {
                    username: username,
                    userId: userId,
                    isReady: false,
                },
            };
            this.sendToClients(sendData, roomId);
            this.roommanager.noticeEntryRoom(roomId, roomMembersData.length);
        }
    }

    _setup() {
        this.wss.onMessage('entryPlay', async (ws, data) => {
            const roomId = data.roomId;
            const ratio = await roomsDB.getRow('ratio', 'room_id', roomId);
            const userId = data.userId;
            let roomMembersData = await roomMemberDB.getRoomMembers(roomId);
            await roomMemberDB.updateIsReady(userId, false);
            this.playclientsmanager.entryRoom(roomId, userId, ws);

            // 割合送信
            console.log('roomMembersData:', roomMembersData);
            await ws.send(
                JSON.stringify({
                    type: 'getRoomMemberData',
                    payload: {
                        ratio: JSON.parse(ratio),
                        roomMembers: roomMembersData,
                    },
                })
            );

            this.playclientsmanager.playClients[roomId].entry++;
            const roomMemberCounts = await roomMemberDB.roomMemberCounts(roomId);
            console.log(this.playclientsmanager.playClients[roomId].entry, roomMemberCounts);
            if (this.playclientsmanager.playClients[roomId].entry == roomMemberCounts) {
                const sendData = {
                    type: 'startGame',
                    payload: {},
                };

                this.sendToClients(sendData, roomId);
            }
        });

        this.wss.onMessage('sendChat', async (ws, data) => {
            const userId = data.userId;
            const text = data.text;
            const roomId = data.roomId;
            const sendData = {
                type: 'sendChat',
                payload: {
                    userId: userId,
                    text: text,
                },
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('readyMessage', async (ws, data) => {
            const roomId = data.roomId;
            const userId = data.userId;
            const isReady = data.isReady;
            roomMemberDB.updateIsReady(userId, isReady);

            const sendData = {
                type: 'changeIsReady',
                payload: {
                    userId: userId,
                    isReady: isReady,
                },
            };

            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('moveToPlay', async (ws, data) => {
            const roomId = data.roomId;
            const sendData = {
                type: 'moveToPlay',
                payload: {},
            };

            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('next', async (ws, data) => {
            const roomId = data.roomId;
            const sendData = {
                type: 'nextPhase',
                payload: {},
            };
            this.sendToClients(sendData, roomId);
        });

        this.wss.onMessage('skip', async (ws, data) => {
            const roomId = data.roomId;
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
            const roomId = data.roomId;
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
                this.playclientsmanager.playC[roomId].nextRound = 0;
                const sendData = {
                    type: 'reStart',
                    payload: { tumoPlayerNumber: data.playerNumber },
                };
                this.sendToClients(sendData, roomId);
            }
        });

        this.wss.onMessage('throwHai', async (ws, data) => {
            const roomId = data.roomId;
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

                try {
                    const userId = payload.userId;
                    const roomId = payload.roomId;
                    const parentId = await roomsDB.getRow('parent_id', 'room_id', roomId);

                    if (userId == parentId) {
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
                                userId: userId,
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
            if (index == 0 || index == 1 || index == 2) return;
            client.send(JSON.stringify(sendData));
        });
    }
}
