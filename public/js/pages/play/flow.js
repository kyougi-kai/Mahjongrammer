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

        this.barkdiv = document.getElementById('barkDiv');

        // 上がれるようにする
        document.getElementById('finishButton').addEventListener('click', (e) => {
            this.togoout.tumoreruka();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key == 'x') {
                this.start();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key == 'l') {
                this.throw();
            }
        });

        this._setupWebsocket();
    }

    _setupWebsocket() {
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
            }
        });
        this.wss.onMessage('reStart', () => {
            if(tumoplayerNumber <> this.playermanager.isParent()){
                this.playermanager.parentNumber = (this.playermanager.parentNumber + 1) % this.playermanager.;
            }
            this.reStart(this.playermanager.parentNumber);  
        })
    }

    drawHai() {
        const tango = this.datamanager.pickTango();
        let temporaryHai = new hai(tango.word, tango.partOfSpeech);
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
        // プレイヤーにはいを配る
        let count = 0;
        let nan = setInterval(() => {
            if(count == 6)clearInterval(nan);
            this.drawHai();
            count++;
        }, 200);
        var scoreBord = document.getElementById('scoreBord');
        scoreBord.style.opacity = 1;
        this.uimanager.showBlink(this.playermanager.phaseToPosition(0));

        let isparent = this.playermanager.isParent();
        if (isparent) {
            this.youCanThrow = true;
            this.drawHai();
            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        }
    }

    reStart(nextParent){
        // やること
        let haitable = document.getElementById('wordUp');
        let childcnt = haitable.childElementCount;
        if(childcnt > 0){
            for(let i = 0; i < childcnt; i++){
                haitable.children[i].remove;
            }
        }
        this.nowPhaseNumber = nextParent;
        for(let i = 0; i < this.playermanager.playerMembers.length;i++){
            this.uimanager.hideThrowHai(i);
        }
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
