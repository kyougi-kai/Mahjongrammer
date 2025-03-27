import {HM} from '/js/play/haiManager.js';
import {DM} from '/js/until/dataManager.js';

export default class gameManager{
    constructor(){
        this._dm = new DM();
        this._parentFlag = true;
        this._players = [];
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

        this._hais = [];
        this._scoreBord = document.getElementById('scoreBord');
        this._nowPhase = -1; // 0が親 0~3の数字で回す
        this._ownNumber = -1; //自分が部屋に何番目に入ってきたか
        this._roomMemberCounts = 0; //部屋にいるプレイヤー人数
        this._hm = new HM(
            (word, isBark) => {
                this._playSocket.send(JSON.stringify({throwHai:word, isBark:isBark, targetNumber:this._ownNumber}));
            }
        );
        this._throwHais = document.getElementsByClassName('throw-hai');

        const nameDivs = document.getElementsByClassName('name');
        const parentName = decodeURIComponent(window.location.pathname).split('/')[2];
        const username = document.getElementById('usernameText').textContent;

        this._isParent = username == parentName ? true : false;
        !this._isParent ? document.getElementById('closeBtn').remove() : document.getElementById('closeBtn').style.display = 'block';

        this._barkTime = 5;
        this._barkDiv = document.getElementById('barkDiv');
        this._barkInterval = null;

        //締め切る処理
        document.getElementById('closeBtn')?.addEventListener("click", async (event) => {
            if(this._players.length == 0 || this._players.length == 1)return;
        
            try{
                document.getElementById('closeBtn').style.display = 'none';
                const response = await fetch(`/play/${parentName}`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({roomClose:true})
                });
            }
            catch(err){
                console.error(err);
            }
        });

        this._playSocket = new WebSocket(`${protocol}://${window.location.host}/play/${parentName}`);

        //なく
        this._barkDiv.children[0].addEventListener('click', (event) => {
            this._hm.showHai(this._throwHais[this.phaseToPlayerNumber(this._nowPhase)].textContent);
            this._hm.isBark = true;

            this._playSocket.send(JSON.stringify({bark:this._ownNumber}));
        });

        //通信
        this._playSocket.addEventListener('open', () => {
            console.log("サーバーに接続しました");
            this._playSocket.send(JSON.stringify({entryRoom: parentName, username:username}));
        });

        this._playSocket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if(message.hasOwnProperty('forcedFinish')){
                this._parentFlag = false;
                alert('親が退出しました');
                window.location.href = '/room';
            }
            else if(message.hasOwnProperty('roomMembers')){
                console.log('ネームタグの入れ替えをします');
                const roomMembers = message.roomMembers;
                roomMembers.forEach((member, index) => {
                    if(member.username == username){
                        this._ownNumber = index;
                        return;
                    }
                });
                this._roomMemberCounts = roomMembers.length;
    
                Array.from(nameDivs).forEach((value) => {
                    value.children[0].innerHTML = '';
                });
                
                roomMembers.forEach((member, index) => {
                    const target = nameDivs[(2 - this._ownNumber + index) % 4].children[0];
                    index == 0 ? target.style.color = 'red' : target.style.color = 'black';
                    target.innerHTML = member.username;
                });
                this._players = roomMembers.concat();
            }
            else if(message.hasOwnProperty('start')){
                this.gameStart();
            }
            else if(message.hasOwnProperty('throwHai')){
                const targetElement = message.isBark ?
                this._throwHais[this.phaseToPlayerNumber(message.targetNumber)] :
                this._throwHais[this.phaseToPlayerNumber(this._nowPhase)];
                targetElement.innerHTML = message.throwHai;
                targetElement.style.opacity = '1';
                
                message.isBark ? this.nextPhase() : this.barkPhase();
            }
            else if(message.hasOwnProperty('bark')){
                clearInterval(this._barkInterval);
                this._barkDiv.style.display = 'none';
                this._barkDiv.children[1].innerHTML = '';
                this._throwHais[this.phaseToPlayerNumber(this._nowPhase)].style.display = 'none';

                this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = '';
                this._scoreBord.children[this.phaseToPlayerNumber(message.bark)].style.animation = 'blinking 2s infinite ease';
            }
        });

        window.onbeforeunload = (event) => {
            if(this._parentFlag)this._playSocket.send(JSON.stringify({outRoom: parentName, username:username}));
        }
    }

    barkPhase(){
        if(this._ownNumber == this._nowPhase)this._barkDiv.children[0].style.display = 'none';

        this._barkDiv.style.display = 'block';
        let temporaryTime = this._barkTime;
        this._barkDiv.children[1].innerHTML = temporaryTime;
        temporaryTime--;
        this._barkInterval = setInterval(() => {
            if(temporaryTime <= 0){
                this._barkDiv.style.display = 'none';
                this._barkDiv.children[1].innerHTML = temporaryTime;
                clearInterval(this._barkInterval);
                this.nextPhase();
            }
            console.log('call interval');
            this._barkDiv.children[1].innerHTML = temporaryTime;
            temporaryTime--;
        }, 1000);
    }

    gameStart(){
        for(let i = 0; i < 7; i++){
            this._hais.push(this._hm.showHai(this._dm.pickTango()));
        }

        this._scoreBord.style.opacity = '1';

        this.nextPhase();
    }

    nextPhase(){
        this._barkDiv.children[0].style.display = 'block';

        //点滅削除
        if(this._nowPhase != -1)this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = '';

        // this._nowPhase  の更新
        this._nowPhase = (this._nowPhase + 1) % this._roomMemberCounts;

        //点滅付与
        this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = 'blinking 2s infinite ease';

        //自分のターンなら
        if(this._nowPhase == this._ownNumber){
            this._hm.isMyTurn = true;
            this._hm.showHai(this._dm.pickTango());
        }
    }

    phaseToPlayerNumber(phase){
        return (2 - this._ownNumber + phase) % 4
    }

    throwHai(word){
        this._playSocket.send(JSON.stringify({throwHai:word}));
    }
}
