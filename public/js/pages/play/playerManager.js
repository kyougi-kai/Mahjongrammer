// import { connectionManager } from "../../utils/connectionManager.js";
import { functions } from '/js/utils/functions.js';

export class playerManager {
    /**
     *
     * @param {connectionManager} wss
     */
    constructor(wss) {
        this.playername = document.getElementById('usernameText').innerHTML;
        this.playername = this.ds(this.playername);
        this.nameDivs = document.getElementsByClassName('name');
        console.log(this.nameDivs);
        this.wss = wss;
<<<<<<< Updated upstream
        this.playerMembers = [];
        this.parentName = functions.sN(document.getElementById('parentNameText').innerHTML);
        this.parentNumber = 0;
        this.playerMembers.push(this.parentName);

        const pageName = location.href;
        this.roomId = pageName.split('/')[4];
=======
        this.playerMembers = [[],[]];
        this.parentName = functions.sN(document.getElementById('parentNameText').innerHTML);
        this.parentNumber = 0;
        this.playerMembers[0].push(this.parentName);
        console.log(this.playerMembers[0].length);
        this.playerMembers[1].push(this.playerMembers[0].length);
>>>>>>> Stashed changes
        console.log(this.playerMembers);

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
                        username: this.playername,
                        parentName: this.parentName,
                    },
                };
                sendBeaconFlag = true;
                navigator.sendBeacon(`/post?type=outRoom&username=${this.playername}&parentName=${this.playerMembers[0][0]}`, JSON.stringify(sendData));
            }
        });
    }

    _setupWebsocket() {
        this.wss.onOpen(() => {
            this.playername = functions.sN(this.playername);
            const sendparent = {
                type: 'entryRoom',
                payload: {
                    parentName: this.playerMembers[0][0],
                    username: this.playername,
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
            this.playerMembers[0].push(data.username);
            this.playerMembers[1].push(this.playerMembers[0].length);
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('outRoom', (data) => {
            const idx = this.playerMembers[0].indexOf(data.username);
            this.playerMembers[0].splice(idx, 1);
            this.playerMembers[1].splice(idx, 1);
            console.log(`${data.username}が退出しました`);
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        /*
            {
                roomMembers:['1人目の名前', '二人目の名前', '三']
            }
        */
        this.wss?.onMessage('getRoomMemberData', (data) => {
            this.playerMembers[0] = data.roomMembers;
            console.log('getRoomMemberData');
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        this.wss?.onMessage('closeRoom', (data) => {
            alert('親が退出しました');
            window.location.href = '/room';
        });
    }

    // playerMembersの値を使って名前を表示する
    updatePlayerName() {
        const nanka = this.playerMembers[0].indexOf(this.playername);
        let j = 0;
        while (j < 4) {
            if (j !== 2) {
                this.nameDivs[j].children[0].innerHTML = '';
            }
            j++;
        }

        this.playerMembers[0].forEach((value, index) => {
            this.nameDivs[(index + 2 - nanka) % 4].children[0].innerHTML = value;
            if (value == this.playerMembers[0][0] && index == 0) {
                this.nameDivs[(index + 2 - nanka) % 4].children[0].style.color = 'red';
            }
        });
    }

    isParent() {
        console.log('isParent');
        console.log(`playerName : ${this.playername} --- parentName : ${this.parentName}`);
        if (this.getPlayerNumber() == this.parentNumber) {
            return true;
        } else return false;
    }

    get getParent() {
        return this.parentName;
    }

    getPlayerNumber() {
        const number = this.playerMembers[0].indexOf(this.playername);
        return number;
    }

    phaseToPosition(phase) {
        const wa = this.playerMembers[0].indexOf(this.playername);
        const positionnumber = (phase + 2 - wa) % 4;
        return positionnumber;
    }

    positonToPhase(position) {
        const phasenumber = this.playerMembers[0].indexOf(this.nameDivs[position].children[0].innerHTML);
        return phasenumber;
    }
}
