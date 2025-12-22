import { tango } from '/js/utils/wordData.js';
import { functions } from '/js/utils/functions.js';
import { AM } from '/js/utils/audioManager.js';

export class uiManager {
    constructor(playermanager) {
        this.playermanager = playermanager;
        this.haimanager = null;
        this.throwHaiTable = document.getElementsByClassName('throw-hai-table')[0];

        this.elements = {
            mainContent: document.getElementsByClassName('main-content')[0],
            barkDiv: document.getElementById('barkDiv'),
            ponButton: document.getElementsByName('pon')[0],
            skipButton: document.getElementsByName('skip')[0],
            agariButton: document.getElementsByName('agari')[0],
            countDownText: document.getElementById('countDown'),
            playerStatus: document.getElementsByClassName('player-status'),
            haiMenu: document.getElementById('radialMenu'),
            meanButton: document.getElementsByName('meanRadialButton')[0],
            conjugationButton: document.getElementsByName('conjugationRadialButton')[0],
            throwButton: document.getElementsByName('throwRadialButton')[0],
            tagText: document.getElementById('tagText'),
            reachButton: document.getElementsByName('reachRadialButton')[0],
            hinsiSentaku: document.getElementsByClassName('hinsi-sentaku')[0],
            hinsiBody: document.getElementsByClassName('hinsi-body')[0],
            topTehuda: document.getElementsByClassName('top-tehuda')[0],
            rightTehuda: document.getElementsByClassName('right-tehuda')[0],
            leftTehuda: document.getElementsByClassName('left-tehuda')[0],
        };

        this.flow = null;
        this.scoreBord = document.getElementsByClassName('ten');
        this.winner = document.getElementById('winner');
        this.resultPage = document.getElementById('resultpage');
        this.playResultPage = document.getElementById('playResult');
        this.topleft = document.getElementById('oyaban');
        this.tops = ['4%', '81%', '81%', '4%'];
        this.lefts = ['78%', '78%', '2%', '2%'];
        this.redtops = ['5%','29%','5%','29%'];
        this.redlefts = ['28%','77%','82%','5%'];
        this.redwidths = ['100px','37px','100px','37px'];
        this.redheights= ['37px','100px','37px','100px'];

        this.wordUp = document.getElementById('wordUp');
        this.wordDown = document.getElementById('wordDown');

        // doras表示
        this.doraTable = document.getElementsByClassName('dora-badge')[0];

        // チートdiv
        this.hinsiDiv = document.getElementById('hinsiDrop');
        this.tagDiv = document.getElementById('tagDrop');
        let hinsiList = [];
        Object.values(tango).forEach((value) => {
            value.hinsi.forEach((val) => {
                if (hinsiList.indexOf(val) == -1) {
                    hinsiList.push(val);
                }
            });
        });

        hinsiList.forEach((value) => {
            let temporary = document.createElement('option');
            temporary.setAttribute('value', value);
            temporary.innerHTML = value;
            this.hinsiDiv.appendChild(temporary);
        });

        const changeTag = () => {
            this.tagDiv.innerHTML = '';
            let tagList = [];
            Object.values(tango).forEach((word) => {
                if (word.hinsi.indexOf(this.hinsiDiv.value) != -1) {
                    word.tags.forEach((tag) => {
                        if (tagList.indexOf(tag) == -1) {
                            tagList.push(tag);
                        }
                    });
                }
            });
            console.log(tagList);

            tagList.forEach((tag) => {
                let temporary = document.createElement('option');
                temporary.setAttribute('value', tag);
                temporary.innerHTML = tag;
                this.tagDiv.appendChild(temporary);
            });
        };

        changeTag();

        this.hinsiDiv.addEventListener('change', (e) => {
            changeTag();
        });

        document.getElementById('pickButton').addEventListener('click', () => {
            document.getElementById('cheatDiv').style.display = 'none';

            let pickWordList = [];
            Object.keys(tango).forEach((word) => {
                if (tango[word].hinsi.indexOf(this.hinsiDiv.value) != -1 && tango[word].tags.indexOf(this.tagDiv.value) != -1) {
                    pickWordList.push(word);
                }
            });

            let pickWord = pickWordList[Math.floor(Math.random() * pickWordList.length)];
            this.flow.drawHai(pickWord);
        });

        // イベント設定
        this.setCloseEvents();
    }

    setFlow(flow) {
        this.flow = flow;
        this.domEvents();
    }

    // domイベント設定
    domEvents() {
        this.elements.ponButton.addEventListener('click', () => {
            this.flow.pon();
        });

        this.elements.skipButton.addEventListener('click', () => {
            this.flow.skip();
        });

        // 意味表示ボタン
        this.elements.meanButton.addEventListener('mousedown', async () => {
            if (this.haimanager.nowHai == null) return;
            const word = this.haimanager.nowHai.children[0].innerHTML;
            this.showWordMean(word, this.haimanager.nowHai);
        });

        // 活用変更ボタン
        this.elements.conjugationButton.addEventListener('mousedown', () => {
            if (this.haimanager.nowHai == null) return;
            this.haimanager.changeKatuyou(this.haimanager.nowHai);
        });

        // 捨てるボタン
        this.elements.throwButton.addEventListener('mousedown', () => {
            if (this.haimanager.nowHai == null) return;
            this.flow.throw(this.haimanager.nowHai);
        });

        // リーチボタン
        this.elements.reachButton.addEventListener('mousedown', () => {
            this.elements.hinsiSentaku.style.display = 'block';
            this.elements.hinsiSentaku.style.opacity = '1';
        });

        // 品詞選択ボタン
        Array.from(this.elements.hinsiBody.children).forEach((element) => {
            element.addEventListener('click', () => {
                this.flow.reach(element.getAttribute('name'));
                this.elements.hinsiSentaku.style.opacity = '0';
                this.elements.hinsiSentaku.style.display = 'none';

                this.disableDragAllChildren(this.wordUp);
                this.disableDragAllChildren(this.wordDown);

                // リーチできなくする
                this.elements.reachButton.style.display = 'none';

                this.elements.ponButton.innerHTML = 'ロン';
            });
        });
    }

    showCheatDiv() {
        document.getElementById('cheatDiv').style.display = 'block';
    }

    showWordMean(word, element) {
        const hinsi = element.getAttribute('name');
        let sentence = tango[word]['tags'].join(' ');
        sentence += '<br>';
        sentence += tango[word]['means'][hinsi];
        this.elements.tagText.innerHTML = sentence;
        this.elements.tagText.style.transition = '0';
        this.elements.tagText.style.opacity = '0';
        this.elements.tagText.style.left = 'none';
        this.elements.tagText.style.bottom = 'none';
        this.elements.tagText.style.display = 'none';
        requestAnimationFrame(() => {
            this.elements.tagText.style.display = 'block';
            this.elements.tagText.style.transition = '0.4s';
            this.elements.tagText.style.opacity = '1';
            this.elements.tagText.style.left = element.getBoundingClientRect().x + element.getBoundingClientRect().width  / 2 + 'px'; //element.getBoundingClientRectがNumberで囲われていたがもともとNumber型っぽかったのではずした
            this.elements.tagText.style.bottom = Number(window.innerHeight) - element.getBoundingClientRect().y + Number(window.innerHeight)/ 200 +'px';//20pxという定数で位置変更していたため、画面の大きさから参照するようにした。

        });
    }

    showThrowHai(hai, position) {
        console.log('捨てた牌を表示するよ！');
        this.throwHaiTable.children[position].style.opacity = '1';
        this.throwHaiTable.children[position].innerHTML = hai;
        this.throwHai = this.throwHaiTable.children[position].children[0];
        this.throwHaiTable.children[position].children[0].style.opacity = '1';
        this.showCountDown();
    }

    initTable() {
        this.wordUp.innerHTML = '';
        this.wordDown.innerHTML = '';
    }

    changePoint(position, point) {
        const targetElement = this.elements.playerStatus[position].getElementsByClassName('ten')[0];
        targetElement.innerHTML = parseInt(targetElement.innerHTML) + Number(point) + '点';
    }

    changePonPoint(point) {
        this.elements.ponButton.innerHTML = 'ポン -' + point;
    }

    getPoint(position) {
        const targetElement = this.elements.playerStatus[position].getElementsByClassName('ten')[0];
        return parseInt(targetElement.innerHTML);
    }

    hideThrowHai(position) {
        try {
            const slot = this.throwHaiTable.children[position];
            if (!slot) return;
            // 子要素やイベントリスナごと消すため、浅いクローンで置換する
            const newSlot = slot.cloneNode(false); // attributes/class はコピーされるが子要素はコピーされない
            newSlot.style.opacity = '0';
            slot.parentNode.replaceChild(newSlot, slot);
        } catch (err) {
            console.log('hideThrowHai エラー', err);
        }
    }

    async showRoundResult(grammerData, playerName, score, tokuten) {
        AM.bgmStop();
        let translateSentence = '';
        for (let i = 0; i < score[1].length; i++) {
            console.log(score[1][i]);
            translateSentence += (await functions.translateEnglish(score[1][i].join(' '))) + ' ';
        }
        console.log(score);
        let utiwake = score[0]
            .toString()
            .match(/[^:]+:\d+/g)
            .join('<br>');
        const items = utiwake.split(' ');

        // 各項目をHTMLに変換
        const tokutenutiwake = items
            .map((item) => {
                // コロンで分割
                const parts = item.split(':');
                if (parts.length === 2) {
                    return `<div style="display: flex; justify-content: space-between;">
                <span>${parts[0]}</span>
                <span>:${parts[1]}</span>
            </div>`;
                }
                return item;
            })
            .join('');
        console.log(Object.values(this.playermanager.playerMembers)[this.playermanager.getPlayerNumber()].name);
        console.log(this.playermanager.playerMembers);
        this.resultPage.style.display = 'flex';
        this.resultPage.getElementsByClassName('result-round')[0].innerHTML = `第${this.flow.roundcnt}ラウンド`;
        this.resultPage.getElementsByClassName('result-name')[0].innerHTML = playerName;
        this.resultPage.getElementsByClassName('score-text')[0].innerHTML = translateSentence + '<br>' + '<br>';
        this.resultPage.getElementsByClassName('score-breakdown')[0].innerHTML = tokutenutiwake;
        this.resultPage.getElementsByClassName('allten')[0].innerHTML = `合計${tokuten}`;
        document.getElementById('resultGrammerDiv').innerHTML = grammerData;
        if (playerName == Object.values(this.playermanager.playerMembers)[this.playermanager.getPlayerNumber()].name) {
            document.getElementById('winner').style.display = 'block';
            this.winner.classList.remove('animation');
            this.winner.classList.add('animation');
        }
    }

    showTieResult(grammerDatas) {
        console.log(grammerDatas);
        this.resultPage.style.display = 'flex';
        this.resultPage.getElementsByClassName('score-text')[0].innerHTML = '';
        this.resultPage.getElementsByClassName('allten')[0].innerHTML = '';
        this.resultPage.getElementsByClassName('result-name')[0].innerHTML = '引き分け';

        let wordUps = '';
        Object.keys(this.playermanager.playerMembers).forEach((id) => {
            wordUps += this.playermanager.playerMembers[id].name + '<br>';
            if (grammerDatas[id] == 'undefined' || grammerDatas[id] == null || grammerDatas[id] == '') {
                wordUps += '<br>';
            } else {
                wordUps += grammerDatas[id] + '<br>';
            }
        });

        document.getElementById('resultGrammerDiv').innerHTML = wordUps;
    }

    hideRoundResult() {
        document.getElementById('resultpage').style.display = 'none';
        document.getElementById('winner').style.display = 'none';
    }

    showCountDown() {
        this.elements.agariButton.style.display = 'none';
        this.elements.barkDiv.style.display = 'block';
        console.log(this.flow.nowPhaseNumber);
        console.log(this.playermanager.getPlayerNumber());
        if (this.playermanager.getPlayerNumber() == this.flow.nowPhaseNumber) {
            console.log('ya');
            this.elements.ponButton.style.display = 'none';
            this.elements.skipButton.style.display = 'none';
        } else {
            if (this.flow.reachHinsi != null) {
                if (this.flow.reachHinsi != null && this.flow.reachHinsi == this.throwHai.getAttribute('name')) {
                    this.elements.ponButton.style.display = 'block';
                } else this.elements.ponButton.style.display = 'none';
            } else {
                this.elements.ponButton.style.display = 'block';
            }

            this.elements.skipButton.style.display = 'block';
        }
        this.count = 2;
        this.elements.countDownText.innerHTML = this.count + 1;
        const countDown = () => {
            this.elements.countDownText.innerHTML = this.count;
            this.count--;
        };
        this.time = setInterval(() => {
            countDown();
            if (this.count < 0) {
                clearInterval(this.time);
                this.elements.countDownText.innerHTML = '';
                this.elements.barkDiv.style.display = 'none';
            }
        }, 1000);
    }

    hideBarkDiv() {
        this.elements.ponButton.style.display = 'none';
        this.elements.skipButton.style.display = 'none';
        this.elements.countDownText.innerHTML = '';
    }

    pon() {
        this.elements.barkDiv.style.display = 'none';
        clearTimeout(this.time);
    }

    barkDivReset() {
        this.elements.barkDiv.style.display = 'none';
        clearTimeout(this.time);
    }

    showPlayResult() {
        this.playResultPage.style.opacity = '1';
        this.playResultPage.style.pointerEvents = 'all';

        let gradeList = [];
        for (let i = 0; i < this.playermanager.getPlayerCount(); i++) {
            gradeList.push(1);

            for (let j = 0; j < this.playermanager.getPlayerCount(); j++) {
                console.log(this.playermanager.phaseToPosition(i));
                console.log(this.scoreBord[this.playermanager.phaseToPosition(i)].innerHTML);
                console.log(parseInt(this.scoreBord[this.playermanager.phaseToPosition(i)].innerHTML));
                if (
                    parseInt(this.scoreBord[this.playermanager.phaseToPosition(i)].innerHTML) <
                    parseInt(this.scoreBord[this.playermanager.phaseToPosition(j)].innerHTML)
                ) {
                    gradeList[i]++;
                }

                if (
                    parseInt(this.scoreBord[this.playermanager.phaseToPosition(i)].innerHTML) ==
                        parseInt(this.scoreBord[this.playermanager.phaseToPosition(j)].innerHTML) &&
                    i > j
                ) {
                    gradeList[i]++;
                }
            }
        }

        console.log(gradeList);

        for (let i = 1; i <= this.playermanager.getPlayerCount(); i++) {
            for (let j = 0; j < this.playermanager.getPlayerCount(); j++) {
                if (i == gradeList[j]) {
                    let temporaryDiv = document.createElement('div');
                    temporaryDiv.classList.add('result-grade');
                    temporaryDiv.innerHTML = `<h2>${j+1}位</h2><h2>${
                        Object.values(this.playermanager.playerMembers)[j].name
                    }</h2><p class="result-score">${this.scoreBord[this.playermanager.phaseToPosition(j)].innerHTML}</p>`;
                    console.log(i,j);
                    this.playResultPage.insertBefore(temporaryDiv, document.getElementById('playResultFinish'));
                }
            }
        }
    }

    /*
        自分のターンになると呼ばれる
    */
    myTurn() {
        this.elements.barkDiv.style.display = 'block';
        this.elements.ponButton.style.display = 'none';
        this.elements.skipButton.style.display = 'none';
        this.elements.agariButton.style.display = 'block';
        this.updateRemainingTurns();
    }

    cutin(text) {
        const overlay = document.createElement('div');
        overlay.textContent = text;
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '50%',
            left: '0',
            transform: 'translate(-100%, -50%)',
            width: '100vw',
            textAlign: 'center',
            fontSize: '200px',
            fontWeight: 'bold',
            color: '#ffab4bff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: '10000',
            pointerEvents: 'none',
            animation: 'cutin-move 1s ease-out forwards',
        });
        const style = document.createElement('style');
        style.textContent = `
        @keyframes cutin-move {
            0% {
                transform: translate(-100%, -50%);
                opacity: 0;
            }
            7% {
                transform: translate(0%, -50%);
                opacity: 1;
            }
            93% {
                transform: translate(0%, -50%);
                opacity: 1;
            }
            100% {
                transform: translate(100%, -50%);
                opacity: 0;
            }
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        overlay.addEventListener('animationend', () => {
            overlay.remove();
            style.remove();
        });
    }

    showRoundStart(nowRound) {
        console.log('function : showRoundStart');
        //ラウンド
        const round = document.createElement('div');
        round.textContent = `第${nowRound}ラウンド`;
        Object.assign(round.style, {
            position: 'fixed',
            top: '10vw',
            left: '0',
            width: '100vw',
            height: '100vh',
            color: 'black', // 文字色
            fontSize: '5vw', // フォントサイズは画面幅に応じて可変
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999', // 他の要素より前面に
            margin: '0',
            padding: '0',
            fontFamily: 'sans-serif',
        });
        let rounds = document.body.appendChild(round);

        setInterval(() => {
            rounds.remove();
        }, 2000);

        this.start_img = document.createElement('img');
        this.start_img.src = '../img/haikeimoji/LETSGRAMMAHJONG2.png';
        Object.assign(this.start_img.style, {
            position: 'fixed',
            top: '10vw',
            left: '25vw',
            width: '50vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999', // 他の要素より前面に
            margin: '0',
            padding: '0',
        });
        let startss = document.body.appendChild(this.start_img);
        //効果音
        AM.soundEffect('lets');

        setInterval(() => {
            startss.remove();
        }, 2000);
    }

    changePhase() {
        if (this.topleft.style.getPropertyValue('--original-html-ban') == '') {
            let idx2 = this.playermanager.phaseToPosition(0);
            console.log(idx2);
            console.log(this.topleft.style.top);
            this.topleft.style.top = this.tops[idx2];
            this.topleft.style.left = this.lefts[idx2];
            this.topleft.style.setProperty('--original-html-ban', 0);
            let i = idx2;
            let j = idx2 + 4;
            let k = 0;
            this.yourtops = [];
            this.yourlefts = [];
            this.yourredtops = [];
            this.yourredlefts = [];
            this.yourredwidht = [];
            this.yourredheight = [];
            for (i; i < j; i++) {
                this.yourtops[k] = this.tops[i % this.tops.length];
                this.yourlefts[k] = this.lefts[i % this.lefts.length];
                k = k + 1;
            }
            console.log(this.tops);
            console.log(this.yourtops);
            console.log(this.lefts);
            console.log(this.yourlefts);
        } else {
            /*let currentIndex = Number(this.topleft.style.getPropertyValue('--original-html-ban'));
            let idx2 = (currentIndex + 1) % this.playermanager.getPlayerCount();*/
            let idx2 = this.playermanager.parentNumber;
            this.topleft.style.top = this.yourtops[idx2];
            this.topleft.style.left = this.yourlefts[idx2];
            this.topleft.style.setProperty('--original-html-ban', idx2);
        }
    }
    errorbox(word) {
        if (this.sumter === undefined) {
            this.sumter = 0;
        }
        if (this.sumter == 0) {
            const errordiv = document.createElement('div');
            errordiv.innerHTML = word;
            Object.assign(errordiv.style, {
                position: 'absolute',
                bottom: '275px',
                left: '15%',
                backgroundColor: 'rgba(109, 109, 109, 0.4)',
                color: '#FFFFFF',
                border: '2px solid #000000',
                zIndex: 9999,
                fontSize: '24px',
                opacity: '1',
                borderRadius: '10px',
                transition: 'opacity 0.5s ease',
                padding: '10px',
                maxWidth: '60%',
            });
            document.body.appendChild(errordiv);

            //効果音
            AM.soundEffects('amiss');

            const displayDuration = 3500;
            this.sumter = 1;
            console.log(this.sumter);
            setTimeout(() => {
                errordiv.style.opacity = '0';
                errordiv.addEventListener('transitionend', () => errordiv.remove(), { once: true });
                this.sumter = 0;
                console.log(this.sumter);
            }, displayDuration);
        }
    }

    showDoras(doras) {
        console.log('showDoras');
        console.log(doras);
        this.doraTable.innerHTML = '';
        doras.forEach((dora) => {
            let temporary = this.haimanager.createHai(dora.word, dora.partOfSpeech);
            temporary.style.animation = '';
            this.doraTable.appendChild(temporary);
        });
    }

    updateRemainingTurns() {
        console.log('Updating remaining turns waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        document.getElementById('turns').innerHTML = this.haimanager.hais.length;
    }

    setCloseEvents() {
        document.addEventListener('mousedown', (e) => {
            this.closeRadialMenu();

            if (!e.target.classList.contains('btn-right')) {
                this.elements.tagText.style.opacity = '0';
            }

            if (!e.target.closest('.btn-top') && !e.target.closest('.hinsi-sentaku')) {
                this.elements.hinsiSentaku.style.opacity = '0';
                this.elements.hinsiSentaku.style.display = 'none';
            }
        });
    }

    showRadialMenu(targetElement) {
        this.elements.haiMenu.style.transition = '';
        this.elements.haiMenu.style.opacity = '0';
        this.elements.haiMenu.style.display = 'none';

        if (targetElement.style.animation == '') this.elements.throwButton.style.display = 'none';
        else this.elements.throwButton.style.display = 'block';

        // 座標系さん
        const rect = targetElement.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        console.log(rect.left, rect.top, rect.width, rect.height);
        console.log(x, y);

        this.elements.haiMenu.style.left = x - 80 + 'px';
        this.elements.haiMenu.style.top = y - 80 + 'px';

        this.elements.haiMenu.style.display = 'block';
        requestAnimationFrame(() => {
            this.elements.haiMenu.style.display = 'block';
            this.elements.haiMenu.style.transition = 'opacity 0.2s ease-out, transform 0.25s cubic-bezier(0.25, 1.4, 0.5, 1)';
            requestAnimationFrame(() => {
                this.elements.haiMenu.style.opacity = '1';
            });
        });
    }

    closeRadialMenu() {
        this.elements.haiMenu.style.opacity = '0';
    }

    disableDragAllChildren(rootElement) {
        rootElement.querySelectorAll('*').forEach((el) => {
            el.setAttribute('draggable', 'false');
            el.style.animation = '';
        });
    }

    showReachHai(position, leftHai, rightHai) {
        let temporaryhai = document.createElement('div');
        temporaryhai.classList.add('border-div');
        temporaryhai.style.background = 'white';

        if (leftHai == null) leftHai = '';
        if (rightHai == null) rightHai = '';
        switch (position) {
            case 0:
                this.elements.topTehuda.innerHTML = leftHai + temporaryhai.outerHTML + rightHai;
                break;
            case 1:
                this.elements.rightTehuda.innerHTML = leftHai + temporaryhai.outerHTML + rightHai;
                break;
            case 3:
                this.elements.leftTehuda.innerHTML = leftHai + temporaryhai.outerHTML + rightHai;
                break;
        }
    }

    resetTehuda() {
        this.elements.topTehuda.innerHTML = '';
        this.elements.rightTehuda.innerHTML = '';
        this.elements.leftTehuda.innerHTML = '';
    }
}
