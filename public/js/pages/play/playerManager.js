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
        }
    }

    get parentname(){
        return this.parentName;
    }

    test_entryRoom(data){
        this.playerMembers[this.playerMembers.length] = data.username;
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
            this.playerMembers[this.playerMembers.length] = this.data.username;
        });

        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('outRoom', (data) => {

        });

        /*
            {
                roomMembers:['1人目の名前', '二人目の名前', '三']
            }
        */
        this.wss?.onMessage('getRoomMemberData', (data) => {

        });
    }
}
