import { tango } from '/js/utils/wordData.js';
import { functions } from '/js/utils/functions.js';
import { AM } from '/js/utils/audioManager.js';

export class uiManager {
    constructor(playermanager) {
        this.playermanager = playermanager;
        this.haimanager = null;
        this.throwHaiTable = document.getElementsByClassName('throw-hai-table')[0];

        // barkDiv
        this.barkDiv = document.getElementsByClassName('bark-div')[0];
        this.countDownText = document.getElementById('countDown');

        this.flow = null;
        this.scoreBord = document.getElementById('scoreBord');
        this.resultPage = document.getElementById('resultpage');
        this.playResultPage = document.getElementById('playResult');
        this.topleft = document.getElementById('oyaban');
        this.tops = ['-8%', '69%', '69%', '-8%'];
        this.lefts = ['61%', '61%', '-15%', '-15%'];

        this.wordUp = document.getElementById('wordUp');
        this.wordDown = document.getElementById('wordDown');

        this.hideTimeOut = null;

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
    }

    showCheatDiv() {
        document.getElementById('cheatDiv').style.display = 'block';
    }

    setFlow(flow) {
        this.flow = flow;
    }

    showThrowHai(hai, position) {
        console.log('捨てた牌を表示するよ！');
        this.throwHaiTable.children[position].style.opacity = '1';
        this.throwHaiTable.children[position].innerHTML = hai;
        this.throwHaiTable.children[position].children[0].style.opacity = '1';
        this.showCountDown();
    }

    initTable() {
        this.wordUp.innerHTML = '';
        this.wordDown.innerHTML = '';
    }

    changePoint(position, point) {
        const targetElement = this.scoreBord.children[position];
        targetElement.innerHTML = Number(targetElement.innerHTML) + point;
    }

    changePonPoint(point) {
        this.barkDiv.children[0].innerHTML = 'ポン -' + point;
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
        let translateSentence = '';
        for (let i = 0; i < score[1].length; i++) {
            console.log(score[1][i]);
            translateSentence += (await functions.translateEnglish(score[1][i].join(' '))) + ' ';
        }
        this.resultPage.style.display = 'flex';
        this.resultPage.getElementsByClassName('result-name')[0].innerHTML = playerName;
        this.resultPage.getElementsByClassName('score-text')[0].innerHTML = translateSentence + '<br>' + score[0].join('<br>');
        this.resultPage.getElementsByClassName('allten')[0].innerHTML = `合計${tokuten}`;
        document.getElementById('resultGrammerDiv').innerHTML = grammerData;
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
            wordUps += grammerDatas[id] + '<br>';
        });

        document.getElementById('resultGrammerDiv').innerHTML = wordUps;
    }

    hideRoundResult() {
        document.getElementById('resultpage').style.display = 'none';
    }

    showCountDown() {
        this.barkDiv.children[2].style.display = 'none';
        console.log(this.barkDiv);
        this.barkDiv.style.display = 'block';
        console.log(this.flow.nowPhaseNumber);
        console.log(this.playermanager.getPlayerNumber());
        if (this.playermanager.getPlayerNumber() == this.flow.nowPhaseNumber) {
            console.log('ya');
            this.barkDiv.children[0].style.display = 'none';
            this.barkDiv.children[1].style.display = 'none';
        } else {
            this.barkDiv.children[0].style.display = 'block';
            this.barkDiv.children[1].style.display = 'block';
        }
        this.count = 2;
        this.countDownText.innerHTML = this.count + 1;
        const countDown = () => {
            this.countDownText.innerHTML = this.count;
            this.count--;
        };
        this.time = setInterval(() => {
            countDown();
            if (this.count < 0) {
                clearInterval(this.time);
                this.countDownText.innerHTML = '';
                this.barkDiv.style.display = 'none';
            }
        }, 1000);
    }

    hideNowBlink() {
        this.oldBord.style.animation = '';
    }

    showBlink(position) {
        this.oldBord = this.scoreBord.children[position];
        this.scoreBord.children[position].style.animation = 'blinking 2s infinite ease';
    }

    hideBarkDiv() {
        this.barkDiv.children[0].style.display = 'none';
        this.barkDiv.children[1].style.display = 'none';
    }

    pon() {
        this.barkDiv.style.display = 'none';
        clearTimeout(this.time);
    }

    barkDivReset() {
        this.barkDiv.style.display = 'none';
        clearTimeout(this.time);
    }

    showPlayResult() {
        this.playResultPage.style.opacity = '1';
        this.playResultPage.style.pointerEvents = 'all';

        let gradeList = [];
        for (let i = 0; i < this.playermanager.getPlayerCount(); i++) {
            gradeList.push(1);

            for (let j = 0; j < this.playermanager.getPlayerCount(); j++) {
                console.log(Number(this.scoreBord.children[this.playermanager.phaseToPosition(i)].innerHTML));
                if (
                    Number(this.scoreBord.children[this.playermanager.phaseToPosition(i)].innerHTML) <
                    Number(this.scoreBord.children[this.playermanager.phaseToPosition(j)].innerHTML)
                ) {
                    gradeList[i]++;
                }

                if (
                    Number(this.scoreBord.children[this.playermanager.phaseToPosition(i)].innerHTML) ==
                        Number(this.scoreBord.children[this.playermanager.phaseToPosition(j)].innerHTML) &&
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
                    temporaryDiv.innerHTML = `<h2>${i}位</h2><h2>${
                        Object.values(this.playermanager.playerMembers)[j].name
                    }</h2><p class="result-score">${Number(this.scoreBord.children[this.playermanager.phaseToPosition(j)].innerHTML)}</p>`;
                    this.playResultPage.insertBefore(temporaryDiv, document.getElementById('playResultFinish'));
                }
            }
        }
    }

    myTurn() {
        this.barkDiv.style.display = 'block';
        this.barkDiv.children[0].style.display = 'none';
        this.barkDiv.children[1].style.display = 'none';
        this.barkDiv.children[2].style.display = 'block';
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
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            color: 'black', // 文字色
            fontSize: '10vw', // フォントサイズは画面幅に応じて可変
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
            top: '0',
            left: '0',
            width: '100vw',
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
            this.showBlink(this.playermanager.phaseToPosition(0));
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
            this.showBlink(this.playermanager.phaseToPosition(this.flow.nowPhaseNumber));
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
            AM.soundEffects("amiss");

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

    showTagText() {
        if (this.hideTimeOut != null) clearTimeout(this.hideTimeOut);
    }

    hideTagText() {
        if (this.hideTimeOut != null) clearTimeout(this.hideTimeOut);
        this.hideTimeOut = null;

        this.hideTimeOut = setTimeout(() => {
            document.getElementById('tagText').style.opacity = '0';
        }, 3000);
    }

    showDoras(doras) {
        console.log('showDoras');
        console.log(doras);
        this.doraTable.innerHTML = '';
        doras.forEach((dora) => {
            let temporary = this.haimanager.createHai(dora.word, dora.partOfSpeech);
            this.doraTable.appendChild(temporary);
        });
    }

    updateRemainingTurns(remainingTurns) {
        document.getElementById('turns').innerHTML = `${remainingTurns - 1}`;
    }
}
