export class playerManager{
    constructor(wss){
        this.wss = wss;
        this.playerMembers = [];
        const pageName = location.href;
        console.log(pageName);
        const parentName = pageName.split('/')[4];
        console.log(parentName);
        this.parentName = this.PageName.substr()
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
    }

    _setup(){
        /*
            data = {
                username : 'ユーザーネーム'
            }
        */
        this.wss?.onMessage('entryRoom', (data) => {
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
