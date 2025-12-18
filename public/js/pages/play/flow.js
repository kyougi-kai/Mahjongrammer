import { AM } from '/js/utils/audioManager.js';

export class flow {
    constructor(wss, uimanager, playermanager, togoout, haimanager) {
        this.wss = wss;
        this.uimanager = uimanager;
        this.playermanager = playermanager;
        this.togoout = togoout;
        this.haimanager = haimanager;
        this.gameCount = 0;
        this.finishbutton = document.getElementById('finishButton');

        // 残りターン（サーバの nextPhase を受けるごとにデクリメント）
        this.remainingTurns = null;

        this.ponCount = 0;
        this.ponCos = 100;
        this.myScore = 2500;

        this.youCanThrow = false;

        this.sendInterval = null;

        // 親を添え字0としたときの番
        this.nowPhaseNumber = 0;

        //ラウンド
        this.roundcnt = 0;
        this.roundResult = '';

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

    // ポンの処理
    pon() {
        if (this.uimanager.getPoint(2) >= (this.ponCount + 1) * this.ponCos) {
            this.ponCount++;
            let ponData = {
                type: 'pon',
                payload: {
                    roomId: this.playermanager.roomId,
                    playerNumber: this.playermanager.getPlayerNumber(),
                    decreasePoint: this.ponCount * this.ponCos,
                    ponOrLon: this.reachHinsi != null ? 'ロン' : 'ポン',
                },
            };
            AM.soundEffect('pon');
            this.wss.send(ponData);

            //効果音
        }
    }

    // skipの処理
    skip() {
        console.log('skip');
        let skipData = {
            type: 'skip',
            payload: {
                roomId: this.playermanager.roomId,
            },
        };
        this.uimanager.hideBarkDiv();
        this.wss.send(skipData);
    }

    // リーチの処理
    reach(hinsi) {
        this.reachHinsi = hinsi;
        console.log('reach');
        let hai = this.haimanager.nowHai;
        hai.removeAttribute('draggable');
        let leftHai = hai.previousElementSibling;
        if (leftHai) {
            leftHai.style.animation = '';
            leftHai = leftHai.outerHTML;
        }
        let rightHai = hai.nextElementSibling;
        if (rightHai) {
            rightHai.style.animation = '';
            rightHai = rightHai.outerHTML;
        }

        let reachData = {
            type: 'reach',
            payload: {
                roomId: this.playermanager.roomId,
                hai: hai.outerHTML,
                leftHai: leftHai,
                rightHai: rightHai,
            },
        };
        this.youCanThrow = false;
        this.wss.send(reachData);

        this.appendTemporaryHai(hai);
        hai.remove();
        //効果音
        AM.soundEffects('athrowhai');
    }

    appendTemporaryHai(targetElement) {
        // 仮の牌
        let temporaryHai = document.createElement('div');
        temporaryHai.classList.add('border-div');
        temporaryHai.style.opacity = '0.5';
        temporaryHai.style.backgroundImage = `url(/img/partOfSpeech/${this.reachHinsi}.png)`;
        temporaryHai.setAttribute('name', 'fantomu');
        targetElement.after(temporaryHai);
    }

    _setupWebsocket() {
        // 上がれるようにする
        document.getElementById('finishButton').addEventListener('click', (e) => {
            let score = this.togoout.tumo();
            if (score != 0) {
                this.finishbutton.style.display = 'none';
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

        // 次へのボタンを押したら
        document.getElementById('resultbutton').addEventListener('click', (e) => {
            this.uimanager.hideRoundResult();
            let sendData = {
                type: 'nextRound',
                payload: {
                    roomId: this.playermanager.roomId,
                    playerNumber: this.nowPhaseNumber,
                    roundResult: this.roundResult,
                },
            };

            this.wss.send(sendData);
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
                        console.log(`得点内訳: ${parts}`);
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

        this.wss.onMessage('reach', (data) => {
            this.uimanager.cutin(`${this.playermanager.getPlayerName(this.nowPhaseNumber)}リーチ！`);
            this.uimanager.showReachHai(this.playermanager.phaseToPosition(this.nowPhaseNumber), data.leftHai, data.rightHai);

            setTimeout(() => {
                try {
                    this.uimanager.changePoint(this.playermanager.phaseToPosition(this.nowPhaseNumber), -1000);
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
            }, 1000);
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
                let temporaryHai = this.haimanager.pon();

                if (this.reachHinsi != null) {
                    temporaryHai.classList.add('reach-hai-border');
                }

                if (this.reachHinsi != null && temporaryHai.getAttribute('name') == this.reachHinsi) {
                    document.getElementsByName('fantomu')[0].after(temporaryHai);
                    document.getElementsByName('fantomu')[0].remove();
                }
            }

            this.uimanager.cutin(`${this.playermanager.getPlayerName(data.ponPlayerNumber)}さんが${data.ponOrLon}！`);
        });
        this.wss.onMessage('reStart', (data) => {
            console.log('reStart');
            console.log(data.tumoPlayerNumber, this.playermanager.parentNumber);
            this.haimanager.initHais(data.hais, data.doras, this.playermanager.getPlayerNumber(), this.playermanager.getPlayerCount());
            if (data.tumoPlayerNumber != this.playermanager.parentNumber && data.roundResult != '引き分け') {
                console.log('親交代');
                this.playermanager.parentNumber = (this.playermanager.parentNumber + 1) % this.playermanager.getPlayerCount();
            }
            this.reStart(this.playermanager.parentNumber);

            this.roundResult = '';
        });

        this.wss.onMessage('redirect', (data) => {
            window.location.href = data.url;
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

        if (this.playermanager.isParent()) {
            this.youCanThrow = true;
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
                    this.scorebords[2].classList.add('color-blink');
                }
                console.log(this.haimanager.hais);
                this.uimanager.myTurn();
                clearInterval(nan);
            }
        }, 200);
    }

    reStart(nextParent) {
        this.gameCount++;
        this.reachHinsi = null;
        this.uimanager.resetTehuda();
        this.uimanager.elements.reachButton.style.display = 'block';
        this.uimanager.elements.ponButton.innerHTML = 'ポン';
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
            this.start();
        }
    }

    nextPhase(isPon = false) {
        console.log('nextPhase()');
        console.log('nowPhaseNumber', this.nowPhaseNumber);
        console.log(`残りの牌: ${this.haimanager.hais.length}`);
        this.uimanager.elements.countDownText.innerHTML = '';

        // 自分のターンだったら
        if (this.nowPhaseNumber == this.playermanager.getPlayerNumber()) {
            if (!isPon && this.haimanager.hais.length > 0) {
                let { hai, hinsi } = this.haimanager.drawHai();
                console.log('どろー');

                if (this.reachHinsi != null) {
                    hai.classList.add('reach-hai-border');
                }

                if (this.reachHinsi != null && hinsi == this.reachHinsi) {
                    document.getElementsByName('fantomu')[0].after(hai);
                    document.getElementsByName('fantomu')[0].remove();
                }
            } else if (!isPon && this.haimanager.hais.length === 0) {
                console.log('すきっぷ');
                let sendData = {
                    type: 'skipTurn',
                    payload: {
                        roomId: this.playermanager.roomId,
                        userId: this.playermanager.userId,
                        playercount: this.playermanager.getPlayerCount(),
                    },
                };
                console.log('０になったらしいからスキップ送るで');
                console.log(sendData);
                this.wss.send(sendData);
            }
            this.youCanThrow = true;
            this.uimanager.myTurn();

            /*this.scorebords[3].style.opacity = 1;
            this.scorebords[3].style.pointerEvents = 'all';*/
            this.scorebords[2].classList.add('color-blink');
        } else {
            /*this.scorebords[3].style.opacity = 0;
            this.scorebords[3].style.pointerEvents = 'none';*/
            this.scorebords[2].classList.remove('color-blink');
        }
        this.uimanager.changePhase();
    }

    sendTie() {
        let sendData = {
            type: 'tie',
            payload: { roomId: this.playermanager.roomId, grammerData: this.uimanager.wordUp.innerHTML, userId: this.playermanager.userId },
        };

        this.wss.send(sendData);
    }

    tie(grammerDatas) {
        this.roundResult = '引き分け';
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

            if (this.reachHinsi != null && hai.getAttribute('name') == this.reachHinsi) {
                this.appendTemporaryHai(hai);
            }
            hai.remove();
            //効果音
            AM.soundEffects('athrowhai');
        }
    }
}
