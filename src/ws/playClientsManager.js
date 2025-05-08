import { connectionManager } from './connectionManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';
import { roomMemberRepository } from '../db/repositories/roomMemberRepository.js';
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
        this.playClients = new Map();
        this.roomsrepository = new roomsRepository();

        this._setup();
    }

    get playC() {
        return this.playClients;
    }

    _setup() {
        this.wss.onMessage('createRoom', async (ws, data) => {
            const parentName = data.roomName;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await this.roomsrepository.getRoomId(parentId);
            this.playClients.set(roomId, { skip: 0 });
        });

        this.wss.onMessage('outRoom', async (ws, data) => {
            const parentName = data.parentName;
            const username = data.username;
            const parentId = await usersManager.nameToId(parentName);
            const roomId = await this.roomsrepository.getRoomId(parentId);
            this.playClients[roomId].delete(username);

            if (username == parentName) {
                this.playClients[roomId].values().forEach((client) => {
                    const sendData = {
                        type: 'forcedFinish',
                        payload: {
                            出てけ: true,
                        },
                    };
                    client.send(JSON.stringify(sendData));
                });

                // playClients削除
                this.playClients.delete(roomId);
            }
        });
    }

    async entryRoom(roomId, username, ws) {
        this.playClients[roomId][username] = ws;
        await this.sendRoomData(roomId);
    }

    async sendRoomData(roomId) {
        const roomMembers = await roomMemberRepository.getRoomMembers(roomId);
        this.playClients[roomId].values().forEach((client) => {
            client.send(
                JSON.stringify({
                    type: 'getRoomMembers',
                    payload: {
                        roomMembers: roomMembers,
                    },
                })
            );
        });
    }
}
