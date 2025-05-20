// import { connectionManager } from "../../utils/connectionManager.js";
import { functions } from "/js/utils/functions.js";

export class playerManager{

    /**
     * 
     * @param {connectionManager} wss 
     */
    constructor(wss){
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

        this._setup();

        document.onkeydown = (e) => {
            if(e.key == 'p'){
                const testData = {
                    username : 'shiro'
                }
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
        }
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

    _setup(){
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
    }

    // playerMembersの値を使って名前を表示する
    updatePlayerName(){
    }
}
