import { hai } from '/js/pages/play/hai.js';
import { tango } from '/js/utils/wordData.js';
export class flow {
    constructor(wss, blockmanager, uimanager, playermanager) {
        this.wss = wss;
        this.blockmanager = blockmanager;
        this.uimanager = uimanager;
        this.playermanager = playermanager;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

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
        this.wss.onMessage('startGame', () => {
            console.log('ゲームスタート');
            this.start();
        });
        this.wss.onMessage('throwHai', (data) => {
            this.uimanager.showThrowHai(data.hai, this.nowPhaseNumber);
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

        try {
            scoreBord.children[this.playermanager.phaseToPosition(0)].style.animation = 'blinking 2s infinite ease';
        } catch (err) {
            scoreBord.children[2].style.animation = 'blinking 2s infinite ease';
        }

        let isparent = this.playermanager.isParent();
        if (isparent) {
            this.drawHai();
        }
    }

    nextPhase() {}

    throw(hai) {
        console.log('flow.js haiを捨てようとしている');
        console.log(hai);
        let phasenumber = this.playermanager.getPlayerNumber();

        if (this.nowPhaseNumber == phasenumber) {
            hai.removeAttribute('draggable');
            let throwData = {
                type: 'throwHai',
                payload: {
                    hai: hai.outerHTML,
                    parentName: this.playermanager.getParent,
                },
            };

            this.wss.send(throwData);
        }
    }
}
