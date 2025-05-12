import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/pages/play/playerManager.js';

export class gameManager {
    constructor() {
        this.connectionmanager = new connectionManager();
        this.playermanager = new playerManager(null);
    }

    ここから;
    getConnectUrl() {
        return `${this.protocol}://${window.location.host}/play/${this.parentName}`;
    }
}

const gamemanager = new gameManager();
