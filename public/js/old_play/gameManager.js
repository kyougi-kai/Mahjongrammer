import { HM } from '/js/play/haiManager.js';
import { DM } from '/js/until/dataManager.js';
import { checkGrammer } from '/js/until/grammercheck.js';

export default class gameManager {
    constructor() {
        this._dm = new DM();
        /**
         * @type {boolean} 親がルーム内にいるかどうか
         */
        this._parentFlag = true;
        this._players = [];
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

        this._hais = [];
        this._scoreBord = document.getElementById('scoreBord');
        this._nowPhase = -1; // 0が親 0~3の数字で回す
        this._ownNumber = -1; //自分が部屋に何番目に入ってきたか
        this._roomMemberCounts = 0; //部屋にいるプレイヤー人数
        this._hm = new HM((haiElement, isBark) => {
            this._playSocket.send(
                JSON.stringify({
                    throwHai: haiElement,
                    isBark: isBark,
                    targetNumber: this._ownNumber,
                })
            );
        });

        this._throwHais = document.getElementsByClassName('throw-hai');

        const nameDivs = document.getElementsByClassName('name');
        const parentName = decodeURIComponent(window.location.pathname).split('/')[2];
        this._username = document.getElementById('usernameText').textContent;
        this._username = this._username.replace(/\s+/g, '');

        this._isParent = this._username == parentName ? true : false;
        !this._isParent ? document.getElementById('closeBtn').remove() : (document.getElementById('closeBtn').style.display = 'block');

        this._barkTime = 5;
        this._barkDiv = document.getElementById('barkDiv');
        this._barkInterval = null;

        this._completeDiv = document.getElementById('completeDiv');

        //締め切る処理
        document.getElementById('closeBtn')?.addEventListener('click', async (event) => {
            if (this._players.length == 0 || this._players.length == 1) return;

            try {
                document.getElementById('closeBtn').style.display = 'none';
                const response = await fetch(`/play/${parentName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomClose: true }),
                });
            } catch (err) {
                console.error(err);
            }
        });

        this._playSocket = new WebSocket(`${protocol}://${window.location.host}/play/${parentName}`);

        //なく
        this._barkDiv.children[0].addEventListener('click', (event) => {
            const word = this._throwHais[this.phaseToPlayerNumber(this._nowPhase)].children[0].textContent;
            let partOfSpeech;
            Object.values(this._dm._tango).forEach((value, idx) => {
                if (value.indexOf(word) != -1) {
                    partOfSpeech = Object.keys(this._dm._tango)[idx];
                }
            });
            this._hm.showHai(word, partOfSpeech);
            this._hm.isBark = true;

            this._playSocket.send(JSON.stringify({ bark: this._ownNumber }));
            this._hm.changeCondition(this._finishButton, true);
        });

        //スキップ
        this._barkDiv.children[1].addEventListener('click', (event) => {
            this._barkDiv.style.display = 'none';
            this._playSocket.send(JSON.stringify({ skip: true }));
        });

        //通信
        this._playSocket.addEventListener('open', () => {
            console.log('サーバーに接続しました');
            this._playSocket.send(JSON.stringify({ entryRoom: parentName, username: this._username }));
        });

        this._playSocket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.hasOwnProperty('forcedFinish')) {
                this._parentFlag = false;
                alert('親が退出しました');
                window.location.href = '/room';
            } else if (message.hasOwnProperty('roomMembers')) {
                console.log('ネームタグの入れ替えをします');
                const roomMembers = message.roomMembers;
                roomMembers.forEach((member, index) => {
                    if (member.username == this._username) {
                        this._ownNumber = index;
                        return;
                    }
                });
                this._roomMemberCounts = roomMembers.length;

                Array.from(nameDivs).forEach((value) => {
                    value.children[0].innerHTML = '';
                });

                roomMembers.forEach((member, index) => {
                    //あとでなおす
                    let targetIndex = (2 - this._ownNumber + index) % 4;
                    if (targetIndex == -1) targetIndex = 3;
                    const target = nameDivs[targetIndex].children[0];
                    index == 0 ? (target.style.color = 'red') : (target.style.color = 'black');
                    target.innerHTML = member.username;
                });
                this._players = roomMembers.concat();
            } else if (message.hasOwnProperty('start')) {
                this.gameStart();
            } else if (message.hasOwnProperty('throwHai')) {
                if (this._nowPhase == this._ownNumber) this._hm.changeCondition(this._finishButton, true);

                const targetElement = message.isBark
                    ? this._throwHais[this.phaseToPlayerNumber(message.targetNumber)]
                    : this._throwHais[this.phaseToPlayerNumber(this._nowPhase)];
                targetElement.innerHTML = message.throwHai;
                targetElement.children[0].style.opacity = '1';
                targetElement.style.opacity = '1';
                this._scoreBord.children[this.phaseToPlayerNumber(message.targetNumber)].style.animation = '';
                this.barkPhase();
            } else if (message.hasOwnProperty('bark')) {
                clearInterval(this._barkInterval);
                this._barkDiv.style.display = 'none';
                this._barkDiv.querySelector('h2').innerHTML = '';
                this._throwHais[this.phaseToPlayerNumber(this._nowPhase)].style.opacity = '0';

                this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = '';
                this._scoreBord.children[this.phaseToPlayerNumber(message.bark)].style.animation = 'blinking-bark 2s infinite ease';
                this._nowPhase = message.bark;

                nameDivs[this.phaseToPlayerNumber(message.bark)].children[1].style.opacity = '1';

                setTimeout(() => (nameDivs[this.phaseToPlayerNumber(message.bark)].children[1].style.opacity = '0'), 2000);
            } else if (message.hasOwnProperty('tangoRatio')) {
                this._dm.updateRatio(message.tangoRatio);
            } else if (message.hasOwnProperty('skip')) {
                this._barkDiv.style.display = 'none';
                this._barkDiv.querySelector('h2').innerHTML = '';
                clearInterval(this._barkInterval);
                this.nextPhase();
            } else if (message.hasOwnProperty('complete')) {
                this.showCompeleteDiv(message.complete, message.username);
            }
        });

        window.onbeforeunload = (event) => {
            if (this._parentFlag) this._playSocket.send(JSON.stringify({ outRoom: parentName, username: this._username }));
        };

        //上がる
        this._finishButton = document.getElementById('finishButton');
        this._finishButton.addEventListener('click', (event) => {
            this.complete();
        });

        //デバッグ用
        document.addEventListener('keydown', (event) => {
            if (event.key == 'a') {
                console.log(this._hm.isBark);
                console.log(this._hm.isMyTurn);
            }
        });
    }

    _setUpDispacher() {}

    showCompeleteDiv(element, username) {
        this._hm.changeCondition(this._completeDiv, true);
        document.getElementById('backgroundDiv').style.opacity = '1';
        document.getElementById('backgroundDiv').style.zIndex = '2';
        document.getElementById('backgroundDiv').style.pointerEvents = 'all';
        this._completeDiv.style.zIndex = '3';
        this._completeDiv.children[0].innerHTML = username;
        this._completeDiv.children[1].innerHTML = element;
    }

    complete() {
        const checkResult = this._hm.sentenceCheck();
        if (!checkResult) return;

        if (
            checkResult.sentence == 0 ||
            checkResult.some((value) => {
                return Object.values(value).some((nan) => nan.length == 0);
            })
        )
            return;

        checkResult.forEach((value) => {
            console.log(value);
            console.log(checkGrammer(value));
        });

        if (checkResult.every((value) => checkGrammer(value))) {
            const targetHais = Array.from(this._hm._divisions).filter((value) => value.style.opacity == '1');
            console.log(targetHais);
            this._playSocket.send(JSON.stringify({ complete: document.getElementsByClassName('hai-table')[0].outerHTML, username: this._username }));
        } else {
            alert('ばかが');
        }
    }

    barkPhase() {
        if (this._ownNumber == this._nowPhase) {
            this._barkDiv.children[0].style.display = 'none';
            this._barkDiv.children[1].style.display = 'none';
        } else {
            this._barkDiv.children[0].style.display = 'block';
            this._barkDiv.children[1].style.display = 'block';
        }

        this._barkDiv.style.display = 'block';
        let temporaryTime = this._barkTime;
        this._barkDiv.querySelector('h2').innerHTML = temporaryTime;
        temporaryTime--;
        this._barkInterval = setInterval(() => {
            if (temporaryTime <= 0) {
                this._barkDiv.style.display = 'none';
                this._barkDiv.querySelector('h2').innerHTML = temporaryTime;
                clearInterval(this._barkInterval);
                this.nextPhase();
            }
            console.log('call interval');
            this._barkDiv.querySelector('h2').innerHTML = temporaryTime;
            temporaryTime--;
        }, 1000);
    }

    gameStart() {
        for (let i = 0; i < 7; i++) {
            this.pickTango();
        }

        this._scoreBord.style.opacity = '1';

        this.nextPhase();
    }

    nextPhase() {
        //点滅削除
        if (this._nowPhase != -1) this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = '';

        // this._nowPhase  の更新
        this._nowPhase = (this._nowPhase + 1) % this._roomMemberCounts;

        //点滅付与
        this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = 'blinking 2s infinite ease';

        //自分のターンなら
        if (this._nowPhase == this._ownNumber) {
            this._hm.changeCondition(this._finishButton, true);
            this._hm.isMyTurn = true;
            this.pickTango();
        }
    }

    phaseToPlayerNumber(phase) {
        return (2 - this._ownNumber + phase) % 4 == -1 ? 3 : (2 - this._ownNumber + phase) % 4;
    }

    throwHai(word) {
        this._playSocket.send(JSON.stringify({ throwHai: word }));
    }

    pickTango() {
        const tango = this._dm.pickTango();
        this._hais.push(this._hm.showHai(tango.word, tango.partOfSpeech));
    }
}
