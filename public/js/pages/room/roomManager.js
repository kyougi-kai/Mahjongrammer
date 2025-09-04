import { connectionManager } from '/js/utils/connectionManager.js';
import { playerManager } from '/js/utils/playerManager.js';
import { actionManager } from '/js/pages/room/actionManager.js';

export class roomManager {
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

const roommanager = new roomManager();

const backgroundDiv = document.getElementById('backdiv'); 
const settingdiv = document.getElementById('settingdiv');
    document.getElementById('settingBtn').addEventListener('click', () => {
        backgroundDiv.style.opacity = '1';
        backgroundDiv.style.pointerEvents = 'all';
        settingdiv.style.opacity = '1';
        settingdiv.style.pointerEvents = 'all';
    });

    backgroundDiv.addEventListener('click', (e) => {
        backgroundDiv.style.opacity = '0';
        backgroundDiv.style.pointerEvents = 'none';
        settingdiv.style.opacity = '0';
        settingdiv.style.pointerEvents = 'none';
    });

    document.getElementById('ChangeUpColor1').addEventListener('click', () => {
        
    });