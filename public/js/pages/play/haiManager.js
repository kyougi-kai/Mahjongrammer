/*
・牌ができる
・持ち場を移動
・wordData.js参照してwordから品詞をだしてなんか変数に保存する
*/

import { tango } from '/js/utils/wordData.js';

export class haiManager {
    constructor(wss, datamanager, blockmanager, uimanager) {
        this.wss = wss;
        this.datamanager = datamanager;
        this.blockmanager = blockmanager;
        this.uimanager = uimanager;
        this.hais = [];
        this.tagText = document.getElementById('tagText');
        this.throwElement = null;

        this.wss.onMessage('getRoomMemberData', (data) => {
            this.datamanager.updateRatio(data.ratio);
        });

        this.wss.onMessage('reStart', (data) => {
            this.hais = data.hais;
        });

        this.wss.onMessage('throwHai', (data) => {
            this.throwElement = data.hai;
        });
    }

    // 自分が引く牌だけ残す
    initHais(hais, number, max) {
        console.log('start initHais');
        this.hais = hais;
        let temporaryHais = [];
        temporaryHais = this.hais.slice(number * 7, number * 7 + 7).concat();
        for (let i = max * 7 + number; i < this.hais.length; i = i + max) {
            console.log(i);
            temporaryHais.push(this.hais[i]);
        }

        console.log(number, max);
        console.log(this.hais);
        console.log(temporaryHais);

        this.hais = temporaryHais;
    }

    // ponした牌を手元に追加
    pon() {
        let nanka = document.createElement('div');
        nanka.innerHTML = this.throwElement;

        this.blockmanager.attachDraggable(nanka.children[0]);
        nanka.children[0].style.opacity = '1';
        nanka.children[0].addEventListener('click', () => {
            nanka.changeKatuyou();
        });
        document.getElementById('wordDown').appendChild(nanka.children[0]);
        nanka.remove();
    }

    drawHai(word = null) {
        console.log('---drawHai---');
        console.log(this.hais);
        console.log(this.hais[0]);
        let tango = word;
        let temporaryHai = '';
        if (tango === null) {
            tango = this.hais.pop();
            temporaryHai = this.createHai(tango.word, tango.partOfSpeech);
        } else temporaryHai = this.createHai(tango.word, tango.partOfSpeech);
        this.blockmanager.attachDraggable(temporaryHai);

        document.getElementById('wordDown').appendChild(temporaryHai);
    }

    createHai(word, hinsi = null) {
        hinsi == null ? (hinsi = tango[word]['hinsi'][0]) : 0;
        let hai = document.createElement('div');
        hai.classList.add('border-div');

        const p = document.createElement('p');
        p.innerHTML = word;
        hai.appendChild(p);

        let clickTimer = null;

        hai.addEventListener('click', (e) => {
            if (clickTimer) return;

            clickTimer = setTimeout(() => {
                this.changeKatuyou(hai);
                clickTimer = null;
            }, 200);
        });

        hai.addEventListener('dblclick', (e) => {
            clearTimeout(clickTimer);
            clickTimer = null;
        });

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        let wakusei = '';
        if (hinsi == '名詞') {
            wakusei = Math.floor(Math.random() * 7 + 1);
            while (wakusei == 3 || wakusei == 5) {
                wakusei = Math.floor(Math.random() * 7 + 1);
            }
        }
        hai.style.animation = `hai${Math.floor(Math.random() * 3 + 1)} 2s infinite alternate ease-in-out`;
        hai.style.backgroundImage = `url(/img/partOfSpeech/${hinsi + wakusei}.png)`;
        hai.style.backgroundRepeat = 'no-repeat';

        this.attachShowTags(hai, word, hinsi);
        return hai;
    }

    attachShowTags(element, word, hinsi) {
        this.enterDelay = null;
        element.addEventListener('dblclick', () => {
            let sentence = tango[word]['tags'].join(' ');
            sentence += '<br>';
            sentence += tango[word]['means'][hinsi];
            this.showTagText(sentence, element);

            this.uimanager.showTagText();
        });

        element.addEventListener('mouseout', () => {
            clearTimeout(this.enterDelay);
            this.enterDelay = null;
            this.uimanager.hideTagText();
        });
    }

    changeKatuyou(hai) {
        const p = hai.querySelector('p');
        if (!p) return;

        if (hai.style.getPropertyValue('--original-html') == '') {
            hai.style.setProperty('--original-html', p.innerHTML);
        }
        const keys = Object.keys(tango);
        const values = Object.values(tango);
        const index = keys.indexOf(hai.style.getPropertyValue('--original-html'));
        if (values[index].katuyou !== undefined && values[index].katuyou.length != 0) {
            if (hai.style.getPropertyValue('--original-html-ban') == '') {
                let idx2 = (values[index].katuyou.indexOf(p.innerHTML) + 1) % values[index].katuyou.length;
                p.innerHTML = values[index].katuyou[idx2];
                hai.style.setProperty('--original-html-ban', idx2);
            } else {
                let idx2 = (Number(hai.style.getPropertyValue('--original-html-ban')) + 1) % values[index].katuyou.length;
                p.innerHTML = values[index].katuyou[idx2];
                hai.style.setProperty('--original-html-ban', idx2);
            }
        }
    }

    showTagText(word, targetElement) {
        this.tagText.innerHTML = word;
        this.tagText.style.opacity = '1';
        this.tagText.style.left = targetElement.getBoundingClientRect().x + Number(targetElement.offsetWidth) / 2 + 'px';
        this.tagText.style.bottom = Number(window.innerHeight) - targetElement.getBoundingClientRect().y + 20 + 'px';
        // 消す処理
    }
}
