// import { connectionManager } from "../../utils/connectionManager.js";
import { functions } from '/js/utils/functions.js';

export class playerManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.playername = this.ds(document.getElementById('usernameText').innerHTML);
        this.nameDivs = document.getElementsByClassName('name');
        console.log(this.nameDivs);
        this.wss = wss;
        this.playerMembers = {};
        const pageName = location.href;
        this.roomId = pageName.split('/')[4];
        this.userId = functions.sN(document.getElementById('userIdText').innerHTML);
        this.reload = false;

        /* this.wss.send(送りたいデータ);
        送るデータの形式
        const sendData = {
            type:'entryRoom',
            payload:{
                parentName: ,
                username: ,
            }
        }

        */
        this._setupWebsocket();
        this._setup();
    }

    ds(target) {
        return target.replace(/\s+/g, '');
    }

    get parentname() {
        return this.parentName;
    }

    /*  送るデータの内容
        type:'outRoom',
        payload:{
            parentName:
            username:
        }

    */
    _setup() {
        let sendBeaconFlag = false;
        window.addEventListener('beforeunload', () => {
            if (!sendBeaconFlag) {
                let sendData = {
                    type: 'outRoom',
                    payload: {
                        userId: this.userId,
                        roomId: this.roomId,
                    },
                };
                sendBeaconFlag = true;
                navigator.sendBeacon(`/post?type=outRoom&userId=${this.userId}&roomId=${this.roomId}`, JSON.stringify(sendData));
            }
        });
    }

    _setupWebsocket() {
        this.wss.onOpen(() => {
            const sendparent = {
                type: 'entryRoom',
                payload: {
                    roomId: this.roomId,
                    userId: this.userId,
                },
            };
            this.wss.send(sendparent);
            console.log(sendparent);
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('entryRoom', (data) => {
            this.playerMembers[data.userId] = data.username;
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        /*
            data = {
                playerNumber : プレイヤーナンバー
            }
        */
        this.wss?.onMessage('outRoom', (data) => {
            console.log(`${this.playerMembers[data.userId]}が退出しました`);
            delete this.playerMembers[data.userId];
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        /*
            {
                roomMembers:['1人目の名前', '二人目の名前', '三']
            }
        */
        this.wss?.onMessage('getRoomMemberData', (data) => {
            console.log('getRoomMemberData');
            console.log(data);
            data.roomMembers.forEach((user) => {
                this.playerMembers[user.user_id] = user.username;
            });
            console.log(this.playerMembers);
            this.updatePlayerName();
            this.reload = true;
        });

        this.wss?.onMessage('closeRoom', (data) => {
            alert('親が退出しました');
            window.location.href = '/home';
        });
    }

    // playerMembersの値を使って名前を表示する
    updatePlayerName() {
        // 一旦全ての表示をリセット
        let j = 0;
        while (j < 4) {
            if (j !== 2) {
                this.nameDivs[j].children[0].innerHTML = '';
                this.nameDivs[j].children[0].style.color = 'black'; // 色リセット
            }
            j++;
        }

        console.log('updatePlayerName');
        console.log(this.playerMembers);
        Object.values(this.playerMembers).forEach((value, index) => {
            console.log(value);
            const nameElem = this.nameDivs[this.phaseToPosition(index)].children[0];

            nameElem.innerHTML = value;
            nameElem.style.color = 'black'; // ← デフォルトに戻す

            if (index == 0) {
                nameElem.style.color = 'red'; // 親だけ赤くする
            }
        });
    }

    isParent() {
        console.log('ーーーisParentーーー');
        console.log('this.getPlayerNumber() = ', this.getPlayerNumber());
        if (this.getPlayerNumber() == 0) {
            return true;
        } else return false;
    }

    // 変えない
    get getParent() {
        return this.parentName;
    }

    getPlayerNumber() {
        const number = Object.keys(this.playerMembers).indexOf(this.userId);
        return number;
    }

    phaseToPosition(phase) {
        const positionnumber = (phase + 2 - this.getPlayerNumber()) % 4;
        return positionnumber;
    }

    positonToPhase(position) {
        const phasenumber = (position + 2 - this.getPlayerNumber()) % 4;
        return phasenumber;
    }

    getPlayerCount() {
        const ninzuu = Object.keys(this.playerMembers).length;
        return ninzuu;
    }
}
