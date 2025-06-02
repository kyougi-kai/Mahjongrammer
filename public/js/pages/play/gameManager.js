import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/pages/play/playerManager.js';
import { flow } from '/js/pages/play/flow.js';

export class gameManager {
    constructor() {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.connectionmanager = new connectionManager();
        this.playermanager = new playerManager(this.connectionmanager);
        this.flow = new flow();

        const connectUrl = this.getConnectUrl();
        this.connectionmanager.connect(connectUrl);

        //テスト
        document.addEventListener('keydown', (e) => {
            if (e.key == 'z') {
                this.flow.drawHai();
            }
        });
    }

    getConnectUrl() {
        return `${this.protocol}://${window.location.host}/play/${this.playermanager.parentname}`;
    }
}

const gamemanager = new gameManager();
