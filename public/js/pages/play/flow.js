import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor(wss) {
        this.wss = wss;
    }

    drawHai() {
        var i = Math.floor(Math.random() * Object.keys(tango).length);
        let keys = Object.keys(tango);
        let key = keys[i];
        let temporaryHai = new hai(key, null);
        document.getElementById('wordDown').appendChild(temporaryHai.getHai);
    }

    start(){
        // プレイヤーにはいを配る

        // 


        this.nextPhase();
    }

    nextPhase(){

    }
}
