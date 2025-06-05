import { connectionManager } from './connectionManager.js';
import { v4 as uuidv4 } from 'uuid';

export class roomClientsManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.wss = wss;
        this.roomClients = new Map();

        this._setup();
    }

    get roomC() {
        return this.roomClients;
    }

    _setup() {
        this.wss.onGet('/room', (ws) => {
            const uuid = uuidv4();
            this.roomClients.set(uuid, ws);

            ws.on('close', () => {
                this.roomClients.delete(uuid);
            });
        });

        this.wss.onMessage('outRoom', (ws, data) => {
            const username = data.username;
            const parentName = data.parentName;
            if (username == parentName) {
                this.roomClients.values().forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: 'deleteRoom',
                            payload: {
                                roomName: data.username,
                            },
                        })
                    );
                });
            }
        });
    }

    noticeOutRoom(roomName, roomMemberCounts) {
        this.roomClients.values().forEach((client) => {
            client.send(
                JSON.stringify({
                    type: 'changeRoomData',
                    payload: {
                        roomName: roomName,
                        roomMemberCounts: roomMemberCounts,
                    },
                })
            );
        });
    }

    noticeDeleteRoom(roomName) {
        this.roomClients.values().forEach((client) => {
            client.send(
                JSON.stringify({
                    type: 'deleteRoom',
                    payload: {
                        roomName: roomName,
                    },
                })
            );
        });
    }
}
