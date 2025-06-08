import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor(wss, blockmanager, uimanager) {
        this.wss = wss;
        this.blockmanager = blockmanager;
        this.uimanager = uimanager;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;
    }

    _setupWebsocket() {}

    drawHai() {
        var i = Math.floor(Math.random() * Object.keys(tango).length);
        let keys = Object.keys(tango);
        let key = keys[i];
        let temporaryHai = new hai(key, null);
        this.blockmanager.attachDraggable(temporaryHai.getHai);

        document.getElementById('wordDown').appendChild(temporaryHai.getHai);
    }

    sendStart() {}

    start() {
        // プレイヤーにはいを配る
    }

    nextPhase() {}

    throw(hai) {
        console.log('flow.js haiを捨てようとしている');
    }
}
