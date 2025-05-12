import { playerManager } from "/js/pages/play/playerManager.js";

export class gameManager{
    constructor(){
        this.playermanager = new playerManager(null);
    }
}

const gamemanager = new gameManager();