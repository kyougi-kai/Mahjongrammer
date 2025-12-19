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
        this.doras = [];
        this.throwElement = null;

        this.wss.onMessage('getRoomMemberData', (data) => {
            this.datamanager.updateRatio(data.ratio);
        });

        this.wss.onMessage('throwHai', (data) => {
            this.throwElement = data.hai;
        });
        // 意味表示
        this.nowHai = null;
    }

    // 自分が引く牌だけ残す
    initHais(hais, doras, number, max) {
        console.log('start initHais');
        this.hais = hais;
        this.doras = doras;
        this.uimanager.showDoras(this.doras);
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

        let temporaryHai = nanka.children[0];
        document.getElementById('wordDown').appendChild(temporaryHai);
        nanka.remove();

        return temporaryHai;
    }

    drawHai(word = null) {
        console.log('---drawHai---');
        console.log(this.hais);
        console.log(this.hais[0]);
        let tangoo = word;
        let temporaryHai = '';
        if (tangoo === null) {
            tangoo = this.hais.pop();
            console.log(tangoo);
            temporaryHai = this.createHai(tangoo.word, tangoo.partOfSpeech);
        } else temporaryHai = this.createHai(tangoo.word, tangoo.partOfSpeech);
        this.blockmanager.attachDraggable(temporaryHai);

        document.getElementById('wordDown').appendChild(temporaryHai);
        console.log(`残りの牌: ${this.hais.length}`);

        temporaryHai.addEventListener('click', () => {
            this.uimanager.showRadialMenu(temporaryHai);
            this.nowHai = temporaryHai;
        });

        return { hai: temporaryHai, hinsi: tangoo.partOfSpeech };
    }

    createHai(word, hinsi = null) {
        hinsi == null ? (hinsi = tango[word]['hinsi'][0]) : 0;
        let hai = document.createElement('div');
        hai.classList.add('border-div');

        const p = document.createElement('p');
        p.innerHTML = word;
        hai.appendChild(p);

        // 後ろに画像表示 名詞はとりあえず1番目のやつ
        let wakusei = '';
        if (hinsi == '名詞') {
            wakusei = Math.floor(Math.random() * 7 + 1);
            while (wakusei == 3 || wakusei == 5) {
                wakusei = Math.floor(Math.random() * 7 + 1);
            }
        }
        hai.style.animation = `hai${Math.floor(Math.random() * 3 + 1)} 2s infinite alternate ease-in-out`;
        hai.style.backgroundImage = `url(/img/partOfSpeech/${hinsi}.png)`;
        hai.style.backgroundRepeat = 'no-repeat';
        hai.setAttribute('name', hinsi);
        return hai;
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
}
