import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor() {}

    drawHai() {
        var i = Math.floor(Math.random() * Object.keys(tango).length);
        let keys = Object.keys(tango);
        let key = keys[i];
        let temporayHai = new hai(key, null);
    }
}
