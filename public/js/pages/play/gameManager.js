import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/pages/play/playerManager.js';

export class gameManager {
    constructor() {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const connectUrl = this.getConnectUrl();
        this.connectionmanager = new connectionManager(connectUrl);
        this.playermanager = new playerManager(this.connectionmanager);
    }

    getConnectUrl() {
        return `${this.protocol}://${window.location.host}/play/${this.parentName}`;
    }
}

const gamemanager = new gameManager();
