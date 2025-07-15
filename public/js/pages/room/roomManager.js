import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/utils/playerManager.js';
import { actionManager } from '/js/pages/room/actionManager.js';

export class gameManager {
    constructor() {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.connectionmanager = new connectionManager();
        this.playermanager = new playerManager(this.connectionmanager, 'room');
        this.actionmanager = new actionManager(this.connectionmanager, this.playermanager);

        const connectUrl = this.getConnectUrl();
        this.connectionmanager.connect(connectUrl);
    }

    getConnectUrl() {
        return `${this.protocol}://${window.location.host}/room/${this.playermanager.roomId}`;
    }
}

const gamemanager = new gameManager();
