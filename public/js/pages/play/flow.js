import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor(wss, blockmanager, uimanager, playermanager, togoout, datamanager) {
        this.wss = wss;
        this.blockmanager = blockmanager;
        this.uimanager = uimanager;
        this.playermanager = playermanager;
        this.togoout = togoout;
        this.datamanager = datamanager;

        this.scorebords = document.getElementById('scoreBord');
        this.youCanThrow = false;
        this.throwElement = null;

        this.sendInterval = null;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

        //ラウンド数
        this.roundcnt = 0;

        this.barkdiv = document.getElementById('barkDiv');

        document.addEventListener('keydown', (e) => {
            if (e.key == 'c') {
                this.cheatPick();
            }

            if (e.key == 'x') {
                this.uimanager.showCheatDiv();
            }
        });

        this._setupWebsocket();
    }

    cheatPick() {
        let tag = window.prompt('単語を入力してください');
        if (tag != '') {
            if (tango.hasOwnProperty(tag)) {
                this.drawHai(tag);
            }
        } else {
            alert('単語を入力してください');
        }
    }

    _setupWebsocket() {
        // 上がれるようにする
        document.getElementById('finishButton').addEventListener('click', (e) => {
            if (this.togoout.tumo()) {
                let tumoData = {
                    type: 'tumo',
                    payload: {
                        roomId: this.playermanager.roomId,
                        grammerData: document.getElementById('wordUp').innerHTML,
                        playerNumber: this.playermanager.getPlayerNumber(),
                    },
                };

                this.wss.send(tumoData);
            }
        });

        document.getElementById('resultbutton').addEventListener('click', (e) => {
            this.uimanager.hideRoundResult();
            let sendData = {
                type: 'nextRound',
                payload: {
                    roomId: this.playermanager.roomId,
                },
            };

            this.wss.send(sendData);
        });

        this.barkdiv.children[0].addEventListener('click', (e) => {
            let ponData = {
                type: 'pon',
                payload: {
                    parentName: this.playermanager.parentname,
                    playerNumber: this.playermanager.getPlayerNumber(),
                },
            };
            this.wss.send(ponData);
        });

        this.barkdiv.children[1].addEventListener('click', (e) => {
            let skipData = {
                type: 'skip',
                payload: {
                    parentName: this.playermanager.parentname,
                },
            };
            this.uimanager.hideponskip();
            this.wss.send(skipData);
        });

        this.wss.onMessage('tumo', (data) => {
            const isTumoPlayer = data.tumoPlayerNumber == this.playermanager.getPlayerNumber();
            this.uimanager.showRoundResult(data.grammerData, isTumoPlayer);
        });

        this.wss.onMessage('getRoomMemberData', (data) => {
            this.datamanager.updateRatio(data.ratio);
        });

        this.wss.onMessage('startGame', () => {
            console.log('ゲームスタート');
            this.start();
        });

        this.wss.onMessage('throwHai', (data) => {
            try {
                this.uimanager.showThrowHai(data.hai, this.playermanager.phaseToPosition(this.nowPhaseNumber));
                if (this.playermanager.isParent()) {
                    let nextData = {
                        type: 'next',
                        payload: {
                            parentName: this.playermanager.getParent,
                        },
                    };
                    this.sendInterval = setTimeout(() => {
                        this.wss.send(nextData);
                    }, 3000);
                }
            } catch (err) {
                this.uimanager.showThrowHai(data.hai, 2);
            }

            this.throwElement = data.hai;
        });

        this.wss.onMessage('nextPhase', () => {
            this.uimanager.pon();
            if (this.sendInterval != null) clearTimeout(this.sendInterval);
            this.sendInterval = null;
            this.nowPhaseNumber = (this.nowPhaseNumber + 1) % this.playermanager.playerMembers.length;
            this.nextPhase();
        });

        this.wss.onMessage('pon', (data) => {
            this.uimanager.hideThrowHai(this.playermanager.phaseToPosition(this.nowPhaseNumber));

            if (this.sendInterval != null) clearTimeout(this.sendInterval);
            this.sendInterval = null;

            this.uimanager.pon();
            this.nowPhaseNumber = data.ponPlayerNumber;
            data.ponPlayerNumber == this.playermanager.getPlayerNumber() ? this.nextPhase(true) : this.nextPhase();
            if (data.ponPlayerNumber == this.playermanager.getPlayerNumber()) {
                let nanka = document.createElement('div');
                nanka.innerHTML = this.throwElement;

                this.blockmanager.attachDraggable(nanka.children[0]);
                nanka.children[0].style.opacity = '1';
                document.getElementById('wordDown').appendChild(nanka.children[0]);
                nanka.remove();
                nanka.children[0].addEventListener('click', () => {
                    this.hai.changeKatuyou();
                });
            }
        });
        this.wss.onMessage('reStart', (data) => {
            this.uimanager.hideNowBlink();
            if (data.tumoPlayerNumber != this.playermanager.parentNumber) {
                this.playermanager.parentNumber = (this.playermanager.parentNumber + 1) % this.playermanager.playerMembers.length;
                this.playermanager.parentName = this.playermanager.playerMembers[this.playermanager.parentNumber];
            }
            this.reStart(this.playermanager.parentNumber);
        });
    }

    drawHai(word = null) {
        let tango = word;
        let temporaryHai = '';
        if (tango === null) {
            tango = this.datamanager.pickTango();
            temporaryHai = new hai(tango.word, tango.partOfSpeech);
        } else temporaryHai = new hai(tango);
        this.blockmanager.attachDraggable(temporaryHai.getHai);

        document.getElementById('wordDown').appendChild(temporaryHai.getHai);
    }

    setStartButton(element) {
        element.addEventListener('click', (e) => {
            let startData = {
                type: 'startGame',
                payload: {
                    parentName: this.playermanager.getParent,
                },
            };
            this.wss.send(startData);
            element.remove();
        });
    }

    sendStart() {
        let startData = {
            type: 'startGame',
            payload: {
                parentName: this.playermanager.getParent,
            },
        };
        this.wss.send(startData);
    }

    start() {
        //ラウンド
        this.topleft = document.getElementById('oyaban');
        this.tops = ['-8%', '69%', '69%', '-8%'];
        this.lefts = ['61%', '61%', '-15%', '-15%'];
        this.roundcnt = this.roundcnt + 1;
        this.round = document.createElement('div');
        this.round.textContent = `第${this.roundcnt}ラウンド`;
        Object.assign(this.round.style, {
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
        let rounds = document.body.appendChild(this.round);

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

        setInterval(() => {
            startss.remove();
        }, 2000);

        // プレイヤーにはいを配る
        let count = 0;
        let nan = setInterval(() => {
            if (count == 6) clearInterval(nan);
            this.drawHai();
            count++;
        }, 200);
        var scoreBord = document.getElementById('scoreBord');
        scoreBord.style.opacity = 1;
        this.uimanager.showBlink(this.playermanager.phaseToPosition(this.playermanager.parentNumber));

        let isparent = this.playermanager.isParent();
        if (isparent) {
            this.youCanThrow = true;
            this.drawHai();
            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        }
        if (this.topleft.style.getPropertyValue('--original-html-ban') == '') {
            let idx2 = this.playermanager.phaseToPosition(this.playermanager.parentNumber);
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
            for(i;i < j;i++){
                this.yourtops[k] = this.tops[i % this.tops.length];
                this.yourlefts[k] = this.lefts[i % this.lefts.length];
                k = k + 1;
            }
            console.log(this.tops);
            console.log(this.yourtops);
            console.log(this.lefts);
            console.log(this.yourlefts);
        }else{
            console.log(this.playermanager.getPlayerMembers());
            let idx2 = (this.topleft.style.getPropertyValue('--original-html-ban') + 1) % this.playermanager.getPlayerMembers();
            this.topleft.style.top = this.yourtops[idx2];
            this.topleft.style.left = this.yourlefts[idx2];
            this.topleft.style.setProperty('--original-html-ban', idx2);
        }
    }

    reStart(nextParent) {
        // やること
        console.log('reStart');
        this.uimanager.initTable();
        this.nowPhaseNumber = nextParent;
        for (let i = 0; i < this.playermanager.playerMembers.length; i++) {
            // そのうちやる
            try {
                this.uimanager.hideThrowHai(i);
            } catch (err) {
                console.log('すてられた牌がないよ');
            }
        }
        console.log(this.nowPhaseNumber);
        this.start();
    }

    nextPhase(isPon = false) {
        console.log('nextPhase()');
        this.uimanager.hideNowBlink();
        this.uimanager.showBlink(this.playermanager.phaseToPosition(this.nowPhaseNumber));
        if (this.nowPhaseNumber == this.playermanager.getPlayerNumber()) {
            if (!isPon) this.drawHai();
            this.youCanThrow = true;

            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        } else {
            this.scorebords.children[4].style.opacity = 0;
            this.scorebords.children[4].style.pointerEvents = 'none';
        }
    }

    throw(hai) {
        console.log('flow.js haiを捨てようとしている');
        console.log(hai);
        let phasenumber = this.playermanager.getPlayerNumber();
        console.log(phasenumber, this.nowPhaseNumber);

        if (this.nowPhaseNumber == phasenumber && this.youCanThrow) {
            hai.removeAttribute('draggable');
            let throwData = {
                type: 'throwHai',
                payload: {
                    hai: hai.outerHTML,
                    parentName: this.playermanager.getParent,
                },
            };
            this.youCanThrow = false;
            this.wss.send(throwData);
            hai.remove();
        }
    }
}
