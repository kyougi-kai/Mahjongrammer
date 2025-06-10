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
        this.playerMembers = [];
        const pageName = location.href;
        this.parentName = pageName.split('/')[4];
        this.playerMembers.push(this.parentName);
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

    ds(target){
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
                navigator.sendBeacon(`/post?type=outRoom&username=${this.playername}&parentName=${this.playerMembers[0]}`, JSON.stringify(sendData));
            }
        });
    }

    _setupWebsocket() {
        this.wss.onOpen(() => {
            this.playername = functions.sN(this.playername);
            const sendparent = {
                type: 'entryRoom',
                payload: {
                    parentName: this.playerMembers[0],
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
            this.playerMembers.push(data.username);
            console.log(this.playerMembers);
            this.updatePlayerName();
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('outRoom', (data) => {
            const idx = this.playerMembers.indexOf(data.username);
            this.playerMembers.splice(idx, 1);
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
            this.playerMembers = data.roomMembers;
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
        const nanka = this.playerMembers.indexOf(this.playername);
        let j = 0;
        while (j < 4) {
            if (j !== 2) {
                this.nameDivs[j].children[0].innerHTML = '';
            }
            j++;
        }

        this.playerMembers.forEach((value, index) => {
            this.nameDivs[(index + 2 - nanka) % 4].children[0].innerHTML = value;
            if (value == this.playerMembers[0]) {
                this.nameDivs[(index + 2 - nanka) % 4].children[0].style.color = 'red';
            }
        });
    }

    isParent() {
        console.log('isParent');
        console.log(`playerName : ${this.playername} --- parentName : ${this.parentName}`)
        if (this.playername == this.parentName) {
            return true;
        }
        else return false;
    }

    phaseToPosition() {}

    positionToPhase() {}

    get getParent () {
        return this.parentName;
    }

    getPlayerNumber() {
        const number = this.playerMembers.indexOf(this.parentName);
        return number;
    }

    phaseToPosition(phase){

    }

    positonToPhase(position){
        const phasenumber = this.playerMembers.indexOf(this.nameDivs[position].children[0].innerHTML);
        return phasenumber;
    }
}
