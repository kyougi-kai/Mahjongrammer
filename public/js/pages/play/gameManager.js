import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/pages/play/playerManager.js';
import { hai } from '/js/pages/play/hai.js';

export class gameManager {
    constructor() {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.connectionmanager = new connectionManager();
        this.playermanager = new playerManager(this.connectionmanager);

        const connectUrl = this.getConnectUrl();
        this.connectionmanager.connect(connectUrl);

        //テスト
        this.appleHai = new hai('apple');
        document.getElementById('wordDown').appendChild(this.appleHai.createHai());
    }

    getConnectUrl() {
        return `${this.protocol}://${window.location.host}/play/${this.playermanager.parentname}`;
    }
}

const gamemanager = new gameManager();
