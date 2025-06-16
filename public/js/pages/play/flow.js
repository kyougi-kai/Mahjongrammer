import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor(wss, blockmanager, uimanager, playermanager) {
        this.wss = wss;
        this.blockmanager = blockmanager;
        this.uimanager = uimanager;
        this.playermanager = playermanager;

        this.youCanThrow = false;
        this.throwElement = null;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

        this.barkdiv = document.getElementById('barkDiv');

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
                    playerNumber : this.playermanager.getPlayerNumber()
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
            this.uimanager.hideBarkDiv();
            this.wss.send(skipData);
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
                    setTimeout(() => {
                        // this.wss.send(nextData);
                    }, 3000);
                }
            } catch (err) {
                this.uimanager.showThrowHai(data.hai, 2);
            }

            this.throwElement = data.hai;
        });

        this.wss.onMessage('nextPhase', () => {
            this.nowPhaseNumber = (this.nowPhaseNumber + 1) % this.playermanager.playerMembers.length;
            this.nextPhase();
        });

        this.wss.onMessage('pon', (data) => {
            this.uimanager.pon();
            this.nowPhaseNumber = data.ponPlayerNumber;
            data.ponPlayerNumber == this.playermanager.getPlayerNumber() ? this.nextPhase(true) : this.nextPhase();
            if(data.ponPlayerNumber == this.playermanager.getPlayerNumber()){
                let nanka = document.createElement('div');
                nanka.innerHTML = this.throwElement;
                nanka.children[0].setAttribute('draggable', 'true');
                nanka.children[0].style.opacity = '1';
                document.getElementById('wordDown').appendChild(nanka.children[0]);
                nanka.remove();
            };
        });
    }

    drawHai() {
        var i = Math.floor(Math.random() * Object.keys(tango).length);
        let keys = Object.keys(tango);
        let key = keys[i];
        let temporaryHai = new hai(key, null);
        this.blockmanager.attachDraggable(temporaryHai.getHai);

        document.getElementById('wordDown').appendChild(temporaryHai.getHai);
    }

    sajldafj() {
        console.log('jdaosfjaosfjda');
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
        for (let i = 0; i < 7; i++) {
            this.drawHai();
        }
        var scoreBord = document.getElementById('scoreBord');
        scoreBord.style.opacity = 1;
        this.uimanager.showBlink(this.playermanager.phaseToPosition(0));

        let isparent = this.playermanager.isParent();
        if (isparent) {
            this.youCanThrow = true;
            this.drawHai();
            this.scorebords.children[4].style.opacity = 1;
        }
    }

    nextPhase(isPon = false) {
        console.log('nextPhase()');
        this.uimanager.hideNowBlink();
        this.uimanager.showBlink(this.playermanager.phaseToPosition(this.nowPhaseNumber));
        if (this.nowPhaseNumber == this.playermanager.getPlayerNumber()) {
            if(!isPon)this.drawHai();
            this.youCanThrow = true;
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
