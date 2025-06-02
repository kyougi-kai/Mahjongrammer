// import { connectionManager } from "../../utils/connectionManager.js";
import { functions } from "/js/utils/functions.js";

export class playerManager{

    /**
     * 
     * @param {connectionManager} wss 
     */
    constructor(wss){
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

        document.addEventListener('keydown', (e) => {
            if(e.key == 'p'){
                const testData = {
                    username : 'shiro'
                }
                console.log(testData);
                this.test_entryRoom(testData);
            }

            if(e.key == 'o'){
                const testData1 = {
                    username : 'sasa'
                }
                this.test_entryRoom(testData1);
            }
            
            if(e.key == 'i'){
                const testData2 = {
                    username : 'suga'
                }
                this.test_entryRoom(testData2);
            }

            if(e.key == 'q'){
                const testData3 = {
                    username : 'shiro'
                }
                this.test_outRoom(testData3);
            }

            if(e.key == 'w'){
                const testData4 = {
                    username : 'sasa'
                }
                this.test_outRoom(testData4);
            }
            
            if(e.key == 'e'){
                const testData5 = {
                    username : 'suga'
                }
                this.test_outRoom(testData5);
            }

            if(e.key == 'r'){
                //this.nameDivs[0].children[0].innerHTML = 'しろー';
                const nanka = this.playerMembers.indexOf(this.playername);
                let j = 0;
                while(j < 4){
                    if(j !== 2){
                        this.nameDivs[j].children[0].innerHTML = ''
                    }
                    j++
                }

                this.playerMembers.forEach((value, index) => {
                    this.nameDivs[(index + 2 - nanka) % 4].children[0].innerHTML = value;
                    if(value == this.playerMembers[0]){
                        this.nameDivs[(index + 2 - nanka) % 4].children[0].style.color = 'red';
                    }
                });
                /*
                let i = 1;
                while(i < this.playerMembers.length){
                    if(i == 1){
                        this.nameDivs[3].children[0].innerHTML = this.playerMembers[i];
                    }
                    if(i == 2){
                        this.nameDivs[0].children[0].innerHTML = this.playerMembers[i];
                    }
                    if(i == 3){
                        this.nameDivs[1].children[0].innerHTML = this.playerMembers[i];
                    }else{
                        this.nameDivs[2].children[0].style.setProperty('color', 'red', 'important');
                    }
                    i++;
                }
                    */
            }
        })
        this._setupWebsocket();
        this._setup();
    }

    get parentname(){
        return this.parentName;
    }

    test_entryRoom(data){
        this.playerMembers[this.playerMembers.length] = data.username;
        console.log(this.playerMembers);
    }
    test_outRoom(data){
        let i = 1;
        while (i < this.playerMembers.length) {
            if(this.playerMembers[i] == data.username){
                this.playerMembers.splice(i,1);
            }
            i++
        }
        console.log(this.playerMembers);
    }

    /*  送るデータの内容
        type:'outRoom',
        payload:{
            parentName:
            username:
        }

    */
    _setup(){
        window.addEventListener('DOMContentLoaded', () => {
            const sendData = {
                type: "outRoom",
                payload:{
                    parentName:this.playerMembers[0],
                    username:this.playername,
                }
            }
            navigator.sendBeacon("/disconnect-log", JSON.stringify(sendData), true);
        })
    }

    _setupWebsocket(){
        this.wss.onOpen(() => {
            this.playername = document.getElementById('usernameText').innerHTML;
            this.playername = functions.sN(this.playername);
            const sendparent ={
                type:'entryRoom',
                payload:{
                    parentName:this.playerMembers[0],
                    username:this.playername,
                }
            }
            this.wss.send(sendparent);
            console.log(sendparent);
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('entryRoom', (data) => {
            this.playerMembers[this.playerMembers.length] = data.username;
            console.log(this.playerMembers);
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('outRoom', (data) => {
            let i = 1;
            while (i < this.playerMembers.length) {
                if(this.playerMembers[i] == data.username){
                    this.playerMembers.splice(i,1);
                }
                i++
            }
            console.log(this.playerMembers);
        });

        /*
            {
                roomMembers:['1人目の名前', '二人目の名前', '三']
            }
        */
        this.wss?.onMessage('getRoomMemberData', (data) => {
            this.playerMembers = data.roomMembers;
        });

        this.wss?.onMessage('closeRoom', (data) => {
            alert('親が退出しました');
            window.location.href = '/room';
        });
    }

    // playerMembersの値を使って名前を表示する
    updatePlayerName(){
        
    }
}
