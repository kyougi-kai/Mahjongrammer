/*
・牌ができる
・持ち場を移動
・wordData.js参照してwordから品詞をだしてなんか変数に保存する
*/

import { tango } from '/js/utils/wordData.js';
//export const tango1 = Array.isArray(tango) ? tango : [tango];
export const tango1 = Object.entries(tango);

export class hai {
    constructor(word, hinsi = null) {
        this.word = word;
        hinsi == null ? (this.hinsi = tango[word]['hinsi'][0]) : (this.hinsi = hinsi);

        this.createHai();
    }

    createHai() {
        this.hai = document.createElement('div');
        this.hai.innerHTML = this.word;
        this.hai.classList.add('border-div');

        this.hai.addEventListener('click', () => {
            this.changeKatuyou();
        });

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        this.hai.style.backgroundImage = `url(/img/partOfSpeech/${this.hinsi}.png)`;
        return this.hai;
    }

    changeKatuyou() {
        if(this.hai.style.getPropertyValue('--original-html') == ''){
            this.hai.style.setProperty('--original-html', this.hai.innerHTML);
            console.log(this.hai.style.getPropertyValue('--original-html'));
        }
        const keys = Object.keys(tango); 
        const values = Object.values(tango);
        console.log(this.hai.innerHTML);
        const index = keys.indexOf(this.hai.style.getPropertyValue('--original-html'));
        console.log(values[index].katuyou);
        if (values[index].katuyou != undefined) {
            console.log(values[index].katuyou.length);
            const idx2 = (values[index].katuyou.indexOf(this.hai.innerHTML) + 1) % (values[index].katuyou.length);
            this.hai.innerHTML = values[index].katuyou[idx2];
            console.log(values[index].katuyou.indexOf(this.hai.innerHTML));
        };
    }

    get getHai() {
        return this.hai;
    }
}
