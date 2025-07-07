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
        let wakusei = "";
        if(this.hinsi == '名詞'){
            wakusei = Math.floor(Math.random() * 7 + 1);
            while(wakusei == 3 || wakusei == 5){
                wakusei = Math.floor(Math.random() * 7 + 1);
            }
        }
        this.hai.style.animation = `hai${Math.floor(Math.random() * 3 + 1)} 2s infinite alternate ease-in-out`;

        this.hai.style.backgroundImage = `url(/img/partOfSpeech/${this.hinsi + wakusei}.png)`;
        return this.hai;
    }

    changeKatuyou() {
        if(this.hai.style.getPropertyValue('--original-html') == ''){
            this.hai.style.setProperty('--original-html', this.hai.innerHTML);
        }
        const keys = Object.keys(tango); 
        const values = Object.values(tango);
        const index = keys.indexOf(this.hai.style.getPropertyValue('--original-html'));
        if (values[index].katuyou != undefined) {
            if(this.hai.style.getPropertyValue('--original-html-ban') == ''){
                let idx2 = (values[index].katuyou.indexOf(this.hai.innerHTML) + 1) % (values[index].katuyou.length);
                this.hai.innerHTML = values[index].katuyou[idx2];
                this.hai.style.setProperty('--original-html-ban', idx2);
            }else{
                let idx2 = (Number(this.hai.style.getPropertyValue('--original-html-ban')) + 1) % (values[index].katuyou.length);
                this.hai.innerHTML = values[index].katuyou[idx2];
                this.hai.style.setProperty('--original-html-ban', idx2);
            }
        };
    }

    get getHai() {
        return this.hai;
    }
}
