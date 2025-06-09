import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/pages/play/playerManager.js';
import { flow } from '/js/pages/play/flow.js';
import { uiManager } from '/js/pages/play/uiManager.js';
import { blockManager } from '/js/pages/play/blockManager.js';

export class gameManager {
    constructor() {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.connectionmanager = new connectionManager();
        this.playermanager = new playerManager(this.connectionmanager);
        this.blockmanager = new blockManager();
        this.uimanager = new uiManager(this.playermanager);
        this.flow = new flow(this.connectionmanager, this.blockmanager, this.uimanager, this.playermanager);

        this.blockmanager.setFlow(this.flow);
        this.uimanager.setFlow(this.flow);

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
