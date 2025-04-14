import { roomClientsManager } from '../ws/roomClientsManager';

export class roomManager {
    constructor(wss) {
        this.wss = wss;
        this.roomclientsmanager = new roomClientsManager(this.wss);
    }
}
