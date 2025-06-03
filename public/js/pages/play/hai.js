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
        this.hai = document.createElement('div');
        this.createHaihai.innerHTML = this.word;
        this.hai.classList.add('border-div');

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        this.hai.style.backgroundImage = `url(/img/partOfSpeech/${this.hinsi}.png)`;
        console.log(this.word, this.hinsi);
        return hai;
    }
    get getHai() {
        return this.hai
}

/*

関数の省略形

function name(){}

() => {}


*/
