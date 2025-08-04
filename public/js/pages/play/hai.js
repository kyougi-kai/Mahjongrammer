/*
・牌ができる
・持ち場を移動
・wordData.js参照してwordから品詞をだしてなんか変数に保存する
*/

import { tango } from '/js/utils/wordData.js';

export class hai {
    constructor(word, hinsi = null, uimanager) {
        this.uimanager = uimanager;
        this.word = word;
        console.log(word);
        hinsi == null ? (this.hinsi = tango[word]['hinsi'][0]) : (this.hinsi = hinsi);

        this.createHai();
        this.tagText = document.getElementById('tagText');
    }

    createHai() {
        this.hai = document.createElement('div');
        this.hai.classList.add('border-div');

        const p = document.createElement('p');
        p.innerHTML = this.word;
        this.hai.appendChild(p);

        this.hai.addEventListener('click', () => {
            this.changeKatuyou();
        });

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        let wakusei = '';
        if (this.hinsi == '名詞') {
            wakusei = Math.floor(Math.random() * 7 + 1);
            while (wakusei == 3 || wakusei == 5) {
                wakusei = Math.floor(Math.random() * 7 + 1);
            }
        }
        this.hai.style.animation = `hai${Math.floor(Math.random() * 3 + 1)} 2s infinite alternate ease-in-out`;

        this.hai.style.backgroundImage = `url(/img/partOfSpeech/${this.hinsi + wakusei}.png)`;
        this.hai.style.backgroundRepeat = 'no-repeat';

        this.attachShowTags(this.hai);
        return this.hai;
    }

    attachShowTags(element){
        element.addEventListener('mouseenter', () => {
            let word = tango[this.word]['tags'].join(' ');
            word += '<br>';
            word += tango[this.word]['means'][this.hinsi];
            this.showTagText(word, element);
        });

        element.addEventListener('mouseover', () => {
            // 消す処理
        });
    }

    changeKatuyou() {
        const p = this.hai.querySelector('p');
        if (!p) return;

        if (this.hai.style.getPropertyValue('--original-html') == '') {
            this.hai.style.setProperty('--original-html', p.innerHTML);
        }
        const keys = Object.keys(tango);
        const values = Object.values(tango);
        const index = keys.indexOf(this.hai.style.getPropertyValue('--original-html'));
        if (values[index].katuyou !== undefined && values[index].katuyou.length != 0) {
            if (this.hai.style.getPropertyValue('--original-html-ban') == '') {
                let idx2 = (values[index].katuyou.indexOf(p.innerHTML) + 1) % values[index].katuyou.length;
                p.innerHTML = values[index].katuyou[idx2];
                this.hai.style.setProperty('--original-html-ban', idx2);
            } else {
                let idx2 = (Number(this.hai.style.getPropertyValue('--original-html-ban')) + 1) % values[index].katuyou.length;
                p.innerHTML = values[index].katuyou[idx2];
                this.hai.style.setProperty('--original-html-ban', idx2);
            }
        }
    }

    get getHai() {
        return this.hai;
    }

    showTagText(word, targetElement){
        this.tagText.innerHTML = word;
        this.tagText.style.opacity = '1';
        this.tagText.style.left = targetElement.getBoundingClientRect().x + Number(targetElement.offsetWidth) / 2 + 'px';
        this.tagText.style.bottom = Number(window.innerHeight) - targetElement.getBoundingClientRect().y + 20 + 'px';
        // 消す処理
    }
}
