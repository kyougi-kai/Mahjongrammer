import { tango } from '/js/utils/wordData.js';

export class DM {
    constructor() {
        this._ratio = [];

        this._tango = {
            名詞: [],
            動詞: [],
            形容詞: [],
            副詞: [],
            代名詞: [],
            前置詞: [],
            接続詞: [],
            感嘆詞: [],
            冠詞: [],
            助動詞: [],
        };

        Object.keys(tango).forEach((spell) => {
            this._tango[tango[spell].hinsi[0]].push(spell);
        });
    }

    updateRatio(ratio) {
        let sum = ratio.reduce((acc, value) => acc + value, 0);
        this._ratio = ratio.map((value) => value / sum);
    }

    get tango() {
        return this._tango;
    }

    pickTango() {
        let returnValue = {};
        const randomValue = (Math.floor(Math.random() * 1000) % 101) / 100;
        let temporaryWariai = this._ratio.concat();
        temporaryWariai.reduce((acc, cur, idx, array) => {
            if (idx != 0) array[idx] += acc;
            return array[idx];
        });

        let finishFlag = false;
        temporaryWariai.forEach((value, idx) => {
            if (randomValue <= value && !finishFlag) {
                console.log(randomValue + ' : ' + value + ' : ' + idx);
                const targetKey = Object.keys(this._tango)[idx];
                returnValue.word = this._tango[targetKey][Math.floor(Math.random() * this._tango[targetKey].length)];
                returnValue.partOfSpeech = targetKey;
                finishFlag = true;
            }
        });

        return returnValue;
    }
}
