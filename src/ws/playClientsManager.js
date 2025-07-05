import { connectionManager } from './connectionManager.js';
import roomsDB from '../db/repositories/roomsRepository.js';
import roomMemberDB from '../db/repositories/roomMemberRepository.js';
import { usersManager } from '../server/usersManager.js';

export class playClientsManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        /**
         *  @param {connectionManager} this.wss
         */
        this.wss = wss;
        this.playClients = {};

        this._setup();
    }

    get playC() {
        return this.playClients;
    }

    _setup() {
        this.wss.onMessage('outRoom', async (ws, data) => {
            const parentName = data.parentName;
            const username = data.username;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await roomsDB.getRoomId(parentId);
            delete this.playClients[roomId][username];

            if (username == parentName) {
                Object.values(this.playClients[roomId]).forEach((client, index) => {
                    if (index == 0) return;

                    const sendData = {
                        type: 'forcedFinish',
                        payload: {
                            出てけ: true,
                        },
                    };
                    client.send(JSON.stringify(sendData));
                });

                // playClients削除
                delete this.playClients[roomId];
            }
        });
    }

    async entryRoom(roomId, username, ws) {
        const isRoom = await roomsDB.isNull('room_id', roomId);
        if (!isRoom && !this.playClients.hasOwnProperty(roomId)) {
            this.playClients[roomId] = { skip: 0, nextRound: 0 };
        }
        this.playClients[roomId][username] = ws;
    }
}
