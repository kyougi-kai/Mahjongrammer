// import { connectionManager } from "../../utils/connectionManager.js";
import { functions } from '/js/utils/functions.js';

export class playerManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss, type = 'room') {
        this.type = type;
        if (type == 'play') {
            this.playername = this.ds(document.getElementById('usernameText').innerHTML);
            this.nameDivs = document.getElementsByClassName('name');
            console.log(this.nameDivs);
        }

        this.wss = wss;
        this.playerMembers = {};
        const pageName = location.href;
        this.roomId = pageName.split('/')[4];
        this.userId = functions.sN(document.getElementById('userIdText').innerHTML);
        this.parentNumber = 0;

        this.sendBeaconFlag = false;

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
        window.addEventListener('beforeunload', () => {
            if (!this.sendBeaconFlag) {
                let sendData = {
                    type: 'outRoom',
                    payload: {
                        userId: this.userId,
                        roomId: this.roomId,
                    },
                };
                this.sendBeaconFlag = true;
                navigator.sendBeacon(`/post?type=outRoom&userId=${this.userId}&roomId=${this.roomId}`, JSON.stringify(sendData));
            }
        });
    }

    _setupWebsocket() {
        this.wss.onOpen(() => {
            const sendparent = {
                payload: {
                    roomId: this.roomId,
                    userId: this.userId,
                },
            };
            this.type == 'room' ? (sendparent['type'] = 'entryRoom') : (sendparent['type'] = 'entryPlay');
            this.wss.send(sendparent);
            console.log(sendparent);
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('entryRoom', (data) => {
            if (this.type != 'play') {
                this.playerMembers[data.userId] = data.username;
                console.log(this.playerMembers);
                this.addPlayer(data.username, data.isReady);
            }
        });

        /*
            data = {
                playerNumber : プレイヤーナンバー
            }
        */
        this.wss?.onMessage('outRoom', (data) => {
            console.log(`${this.playerMembers[data.userId]}が退出しました`);
            if (this.type == 'room') this.deletePlayer(data.userId);
            delete this.playerMembers[data.userId];
            console.log(this.playerMembers);
            if (this.type == 'play') this.updatePlayerName();
        });

        /*
            {
                roomMembers:['1人目の名前', '二人目の名前', '三']
            }
        */
        this.wss?.onMessage('getRoomMemberData', (data) => {
            console.log('getRoomMemberData');
            console.log(data);
            data.roomMembers.forEach((user, index) => {
                this.playerMembers[user.user_id] = user.username;

                if (this.type == 'room') {
                    if (this.userId == user.user_id && index == 0) this.startBtn = document.getElementById('startBtn').style.display = 'block';
                    this.addPlayer(user.username, user.isReady, index == 0);
                }
            });
            console.log(this.playerMembers);

            if (this.type == 'play') {
                this.updatePlayerName();
            }
        });

        this.wss?.onMessage('closeRoom', (data) => {
            alert('親が退出しました');
            window.location.href = '/home';
        });
    }

    addPlayer(playerName, isReady = false, isHost = false) {
        const playerTag = document.createElement('div');
        playerTag.classList.add('player');
        isReady ? playerTag.classList.add('ready') : playerTag.classList.add('not-ready');
        if (isHost) playerTag.classList.add('host');

        playerTag.innerHTML = playerName;
        document.getElementById('playerTags').appendChild(playerTag);
    }

    deletePlayer(playerId) {
        const idx = Object.keys(this.playerMembers).indexOf(playerId);
        document.getElementById('playerTags').children[idx + 1].remove();
    }

    // playerMembersの値を使って名前を表示する
    updatePlayerName() {
        // 一旦全ての表示をリセット
        let j = 0;
        while (j < 4) {
            if (j !== 2) {
                this.nameDivs[j].children[0].innerHTML = '';
            }
            j++;
        }

        console.log('updatePlayerName');
        console.log(this.playerMembers);
        Object.values(this.playerMembers).forEach((value, index) => {
            console.log(value);
            const nameElem = this.nameDivs[this.phaseToPosition(index)].children[0];

            nameElem.innerHTML = value;
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
    getPlayerName(date) {
        const userIds = Object.keys(this.playerMembers);
        if (date < 0 || date >= userIds.length) return null;
        const userId = userIds[date];
        return this.playerMembers[userId];
    }
}
