import { connectionManager } from '../ws/connectionManager.js';
import { roomClientsManager } from '../ws/roomClientsManager.js';
import { roomsRepository } from '../db/repositories/roomsRepository.js';

export class roomManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.wss = wss;
        this.roomclientsmanager = new roomClientsManager(this.wss);
        this.roomsrepository = new roomsRepository();

        this._setup();
    }

    _setup() {
        this.wss.onGet('/room', async (ws) => {
            const roomData = await this.roomsrepository.getRoomMemberCountData();
            ws.send(JSON.stringify({ type: 'getRoomData', payload: roomData }));
        });
    }
}
