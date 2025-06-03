/*
・牌ができる
・持ち場を移動
・wordData.js参照してwordから品詞をだしてなんか変数に保存する
・/publicがルートディレクトリ
*/

import { tango } from '/js/utils/wordData.js';

export class hai {
    constructor(word, hinsi = null) {
        this.word = word;
        hinsi == null ? (this.hinsi = tango[word]['hinsi'][0]) : (this.hinsi = hinsi);

        this.createHai();
    }

    createHai() {
        const hai = document.createElement('div');
        hai.innerHTML = this.word;
        hai.classList.add('border-div');

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        hai.style.backgroundImage = `url(/img/partOfSpeech/${this.hinsi}.png)`;
        console.log('f');
        return hai;
    }
}

/*

関数の省略形

function name(){}

() => {}


*/
