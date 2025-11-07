import { AM } from '/js/utils/audioManager.js';

export class flow {
    constructor(wss, uimanager, playermanager, togoout, haimanager) {
        this.wss = wss;
        this.uimanager = uimanager;
        this.playermanager = playermanager;
        this.togoout = togoout;
        this.haimanager = haimanager;
        this.gameCount = 0;

        // 残りターン（サーバの nextPhase を受けるごとにデクリメント）
        this.remainingTurns = null;

        this.ponCount = 0;
        this.ponCos = 100;
        this.myScore = 2500;

        this.scorebords = document.getElementById('scoreBord');
        this.youCanThrow = false;

        this.sendInterval = null;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

        //ラウンド数
        this.roundcnt = 0;

        this.barkdiv = document.getElementById('barkDiv');

        document.getElementById('playFinish').addEventListener('click', () => {
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

            if (e.key == 'z') {
                this.uimanager.wordUp.innerHTML =
                    '<div class="sentence-div" draggable="true"><div class="division-div division-s" draggable="true" style="opacity: 1;">\
                    <div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai3; background-image: url(&quot;/img/partOfSpeech/冠詞.png&quot;); background-repeat: no-repeat; opacity: 1;">\
                    <p>a</p></div><div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai3; background-image: url(&quot;/img/partOfSpeech/名詞2.png&quot;); background-repeat: no-repeat; opacity: 1;">\
                    <p>cat</p></div></div><div class="division-div division-v" draggable="true" style="opacity: 1;">\
                    <div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai3; background-image: url(&quot;/img/partOfSpeech/助動詞.png&quot;); background-repeat: no-repeat; opacity: 1;">\
                    <p>can</p></div><div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai3; background-image: url(&quot;/img/partOfSpeech/動詞.png&quot;); background-repeat: no-repeat; opacity: 1;">\
                    <p>play</p></div></div><div class="division-div division-o" draggable="true" style="opacity: 1;">\
                    <div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai1; background-image: url(&quot;/img/partOfSpeech/冠詞.png&quot;); background-repeat: no-repeat; opacity: 1;">\
                    <p>the</p></div><div class="border-div" draggable="true" style="animation: 2s ease-in-out 0s infinite alternate none running hai3; background-image: url(&quot;/img/partOfSpeech/名詞2.png&quot;); background-repeat: no-repeat; opacity: 1;"><p>game</p></div></div></div>';
            }
        });

        this._setupWebsocket();
    }

    cheatPick() {
        let tag = window.prompt('単語を入力してください');
        if (tag != '') {
            if (tango.hasOwnProperty(tag)) {
                this.haimanager.drawHai(tag);
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
                        grammerData: this.uimanager.wordUp.innerHTML,
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
                AM.soundEffect('pon');
                this.wss.send(ponData);

                //効果音
            }
        });

        this.barkdiv.children[1].addEventListener('click', (e) => {
            console.log('skip');
            let skipData = {
                type: 'skip',
                payload: {
                    roomId: this.playermanager.roomId,
                },
            };
            this.uimanager.hideBarkDiv();
            this.wss.send(skipData);
        });

        this.wss.onMessage('tumo', (data) => {
            let tokuten = 0;
            console.log('get tumo');
            console.log(data);

            data.score[0].forEach((scoreString) => {
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
            tokuten *= this.playermanager.getPlayerCount() - 1;
            const tumoPlayerName = Object.values(this.playermanager.playerMembers)[data.tumoPlayerNumber].name;
            this.uimanager.showRoundResult(data.grammerData, tumoPlayerName, data.score, tokuten);
            this.uimanager.changePoint(this.playermanager.phaseToPosition(data.tumoPlayerNumber), tokuten);

            for (let i = 0; i < Object.keys(this.playermanager.playerMembers).length; i++) {
                if (data.tumoPlayerNumber == i) continue;

                this.uimanager.changePoint(this.playermanager.phaseToPosition(i), -tokuten);
            }
        });

        this.wss.onMessage('startGame', (data) => {
            console.log('ゲームスタート');
            this.haimanager.initHais(data.hais, data.doras, this.playermanager.getPlayerNumber(), this.playermanager.getPlayerCount());
            this.start();
        });

        this.wss.onMessage('throwHai', (data) => {
            //引き分け
            console.log(this.haimanager.hais);
            if (this.haimanager.hais.length == 0) {
                this.sendTie();
                return;
            }

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
        });

        this.wss.onMessage('tie', (data) => {
            this.tie(data.grammerDatas);
        });

        this.wss.onMessage('nextPhase', () => {
            this.uimanager.barkDivReset();
            if (this.sendInterval != null) clearTimeout(this.sendInterval);
            this.sendInterval = null;
            this.nowPhaseNumber = (this.nowPhaseNumber + 1) % this.playermanager.getPlayerCount();
            // 残りターンをデクリメントして UI を更新
            if (this.remainingTurns === null) {
                // 初期化されていない場合はセット（安全策）
                this.remainingTurns = 10 * this.playermanager.getPlayerCount();
            } else if (this.remainingTurns > 0) {
                this.remainingTurns--;
            }

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
                this.haimanager.pon();
            }

            this.uimanager.cutin(`${this.playermanager.getPlayerName(data.ponPlayerNumber)}さんがポン！`);
        });
        this.wss.onMessage('reStart', (data) => {
            this.uimanager.hideNowBlink();
            console.log('reStart');
            console.log(data.tumoPlayerNumber, this.playermanager.parentNumber);
            this.haimanager.initHais(data.hais, data.doras, this.playermanager.getPlayerNumber(), this.playermanager.getPlayerCount());
            if (data.tumoPlayerNumber != this.playermanager.parentNumber) {
                this.playermanager.parentNumber = (this.playermanager.parentNumber + 1) % this.playermanager.getPlayerCount();
            }
            this.reStart(this.playermanager.parentNumber);
        });
    }

    start() {
        this.roundcnt++;
        console.log(this.roundcnt);
        if (this.roundcnt >= 2) {
            AM.bgmStop();
        }
        AM.gamebgmStart();
        this.uimanager.showRoundStart(this.roundcnt);

        this.scorebords.style.opacity = 1;
        if (this.playermanager.isParent()) {
            this.youCanThrow = true;
            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        }
        this.uimanager.changePhase();

        // プレイヤーにはいを配る
        let count = 0;
        let nan = setInterval(() => {
            this.haimanager.drawHai();
            count++;
            if (count == 7) {
                if (this.playermanager.isParent()) {
                    this.haimanager.drawHai();
                }
                console.log(this.haimanager.hais);
                this.uimanager.myTurn();
                clearInterval(nan);
            }
        }, 200);
    }

    reStart(nextParent) {
        this.gameCount++;
        if (this.gameCount == 4) {
            // 試合終了時にも捨て牌やテーブルをクリアしておく
            try {
                console.log('reStart: gameCount==4 -> clearing tables and thrown tiles');
                this.uimanager.initTable();
            } catch (err) {
                console.log('initTable エラー', err);
            }

            for (let i = 0; i < this.playermanager.getPlayerCount(); i++) {
                try {
                    console.log('reStart: hideThrowHai for', i);
                    this.uimanager.hideThrowHai(i);
                } catch (err) {
                    // 存在しない場合は無視
                }
            }

            this.uimanager.showPlayResult();
        } else {
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
            if (!isPon) this.haimanager.drawHai();
            this.youCanThrow = true;
            this.uimanager.myTurn();

            this.scorebords.children[4].style.opacity = 1;
            this.scorebords.children[4].style.pointerEvents = 'all';
        } else {
            this.scorebords.children[4].style.opacity = 0;
            this.scorebords.children[4].style.pointerEvents = 'none';
        }
    }

    sendTie() {
        let sendData = {
            type: 'tie',
            payload: { roomId: this.playermanager.roomId, grammerData: this.uimanager.wordUp.innerHTML, userId: this.playermanager.userId },
        };

        this.wss.send(sendData);
    }

    tie(grammerDatas) {
        this.uimanager.showTieResult(grammerDatas);
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
            //効果音
            AM.soundEffects('athrowhai');
        }
    }
}
