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
            const userId = data.userId;
            const roomId = data.roomId;
            delete this.playClients[roomId][userId];
            const parentId = await roomsDB.getRow('parent_id', 'room_id', roomId);

            if (userId == parentId) {
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

    createPlayClient(roomId, turn) {
        this.playClients[roomId] = { roomData: { skip: 0, nextRound: 0, entry: 0, tieCount: 0, tie: {}, turn: turn } };
    }

    async entryRoom(roomId, userId, ws) {
        if (!this.playClients.hasOwnProperty(roomId)) {
            console.log('Error: No such roomId in playClientsManager');
        } else {
            this.playClients[roomId][userId] = ws;
        }
    }
}
