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
        this.gameCount = 0;

        this.ponCount = 0;
        this.ponCos = 100;
        this.myScore = 2500;

        this.scorebords = document.getElementById('scoreBord');
        this.youCanThrow = false;
        this.throwElement = null;

        this.sendInterval = null;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

        //ラウンド数
        this.roundcnt = 0;

        this.barkdiv = document.getElementById('barkDiv');

        document.getElementById('playFinish').addEventListener('click', ()=>{
            this.playermanager.sendBeaconFlag = true;
            window.location = '/room/' + this.playermanager.roomId;
        });

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
            let score = this.togoout.tumo();
            if (score != 0) {
                let tumoData = {
                    type: 'tumo',
                    payload: {
                        roomId: this.playermanager.roomId,
                        grammerData: document.getElementById('wordUp').innerHTML,
                        playerNumber: this.playermanager.getPlayerNumber(),
                        score: score,
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
                    playerNumber: this.nowPhaseNumber,
                },
            };

            this.wss.send(sendData);
        });

        this.barkdiv.children[0].addEventListener('click', (e) => {
            if (Number(this.scorebords.children[2].innerHTML) >= (this.ponCount + 1) * this.ponCos) {
                this.ponCount++;
                let ponData = {
                    type: 'pon',
                    payload: {
                        roomId: this.playermanager.roomId,
                        playerNumber: this.playermanager.getPlayerNumber(),
                        decreasePoint: this.ponCount * this.ponCos,
                    },
                };
                this.wss.send(ponData);
            }
        });

        this.barkdiv.children[1].addEventListener('click', (e) => {
            let skipData = {
                type: 'skip',
                payload: {
                    roomId: this.playermanager.roomId,
                },
            };
            this.uimanager.hideponskip();
            this.wss.send(skipData);
        });

        this.wss.onMessage('tumo', (data) => {
            let tokuten = 0;

            data.score.forEach((scoreString) => {
                
                const items = scoreString.split(' ');
            
                items.forEach((item) => {
                    const parts = item.split(':');
                    if (parts.length === 2) {
                        const point = parseInt(parts[1], 10);
                        if (!isNaN(point)) {
                            tokuten += point;
                        }
                    }
                });
            });
            tokuten *= (this.playermanager.getPlayerCount() - 1);
            const tumoPlayerName = Object.values(this.playermanager.playerMembers)[data.tumoPlayerNumber];
            this.uimanager.showRoundResult(data.grammerData, tumoPlayerName, data.score,tokuten);
            this.uimanager.changePoint(this.playermanager.phaseToPosition(data.tumoPlayerNumber),tokuten);

            for(let i = 0; i < Object.keys(this.playermanager.playerMembers).length; i++){
                if(data.tumoPlayerNumber == i)continue;

                this.uimanager.changePoint(this.playermanager.phaseToPosition(i),-tokuten);
            }
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
                            roomId: this.playermanager.roomId,
                        },
                    };
                    this.sendInterval = setTimeout(() => {
                        this.wss.send(nextData);
                    }, 3000);
                }
            } catch (err) {
                this.uimanager.showThrowHai(data.hai, 2);
            }
            console.log(data.hai);
            this.throwElement = data.hai;
        });

        this.wss.onMessage('nextPhase', () => {
            this.uimanager.pon();
            if (this.sendInterval != null) clearTimeout(this.sendInterval);
            this.sendInterval = null;
            this.nowPhaseNumber = (this.nowPhaseNumber + 1) % this.playermanager.getPlayerCount();
            this.nextPhase();
        });

        this.wss.onMessage('pon', (data) => {
            this.uimanager.hideThrowHai(this.playermanager.phaseToPosition(this.nowPhaseNumber));
            this.uimanager.changePoint(this.playermanager.phaseToPosition(data.ponPlayerNumber), -data.decreasePoint);

            if (this.sendInterval != null) clearTimeout(this.sendInterval);
            this.sendInterval = null;

            this.uimanager.pon();
            this.nowPhaseNumber = data.ponPlayerNumber;
            data.ponPlayerNumber == this.playermanager.getPlayerNumber() ? this.nextPhase(true) : this.nextPhase();
            console.log(data.ponPlayerNumber);
            console.log(this.playermanager.getPlayerNumber());
            if (data.ponPlayerNumber == this.playermanager.getPlayerNumber()) {
                this.uimanager.changePonPoint((this.ponCount + 1) * this.ponCos);

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

            this.uimanager.cutin(`${this.playermanager.getPlayerName(data.ponPlayerNumber)}さんがポン！`);
        });
        this.wss.onMessage('reStart', (data) => {
            this.uimanager.hideNowBlink();
            console.log('reStart');
            console.log(data.tumoPlayerNumber, this.playermanager.parentNumber);
            if (data.tumoPlayerNumber != this.playermanager.parentNumber) {
                this.playermanager.parentNumber = (this.playermanager.parentNumber + 1) % this.playermanager.getPlayerCount();
            }
            this.reStart(this.playermanager.parentNumber);
        });
    }

    drawHai(word = null) {
        let tango = word;
        let temporaryHai = '';
        if (tango === null) {
            tango = this.datamanager.pickTango();
            temporaryHai = new hai(tango.word, tango.partOfSpeech, this.uimanager);
        } else temporaryHai = new hai(tango, null, this.uimanager);
        this.blockmanager.attachDraggable(temporaryHai.getHai);

        document.getElementById('wordDown').appendChild(temporaryHai.getHai);
    }

    start() {
        this.roundcnt++;
        this.uimanager.showRoundStart(this.roundcnt);
        // プレイヤーにはいを配る
        let count = 0;
        let nan = setInterval(() => {
            if (count == 6) clearInterval(nan);
            this.drawHai();
            count++;
        }, 200);

        this.scorebords.style.opacity = 1;
        if (this.playermanager.isParent()) {
            this.youCanThrow = true;
            this.drawHai();
            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        }

        this.uimanager.changePhase();
    }

    reStart(nextParent) {
        this.gameCount++;
        if (this.gameCount == 4) {
            this.uimanager.showPlayResult();
        }
        else{
            // やること
            console.log('reStart');
            this.uimanager.initTable();
            this.nowPhaseNumber = nextParent;
            for (let i = 0; i < this.playermanager.getPlayerCount(); i++) {
                // そのうちやる
                try {
                    this.uimanager.hideThrowHai(i);
                } catch (err) {
                    console.log('すてられた牌がないよ');
                }
            }
            console.log(this.nowPhaseNumber);
            this.uimanager.showBlink(this.playermanager.phaseToPosition(nextParent));
            this.start();
        }
        
    }

    nextPhase(isPon = false) {
        console.log('nextPhase()');
        this.uimanager.hideNowBlink();
        console.log('nowPhaseNumber', this.nowPhaseNumber);
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
        console.log(phasenumber, this.nowPhaseNumber, this.youCanThrow);

        if (this.nowPhaseNumber == phasenumber && this.youCanThrow) {
            hai.removeAttribute('draggable');
            let throwData = {
                type: 'throwHai',
                payload: {
                    hai: hai.outerHTML,
                    roomId: this.playermanager.roomId,
                },
            };
            this.youCanThrow = false;
            this.wss.send(throwData);
            hai.remove();
        }
    }
}
