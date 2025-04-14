import { connectionManager } from './connectionManager';
import { v4 as uuidv4 } from 'uuid';

export class roomClientsManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.wss = wss;
        this.roomClients = new Map();
    }

    _setup() {
        const uuid = uuidv4();

        this.wss.onGet('/room', (ws) => {
            this.roomClients.set(uuid, ws);
        });

        this.wss.onClose('/room', () => {
            this.roomClients.delete(uuid);
        });
    }
}
