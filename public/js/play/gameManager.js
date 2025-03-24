import HM from '/js/play/haiManager.js';

export default class gameManager{
    constructor(){
        this._hais = [];
        this._isParent = false;
        this._scoreBord = document.getElementById('scoreBord');
        this._nowPhase = -1; // 0が親 0~3の数字で回す
        this._ownNumber = -1; //自分が部屋に何番目に入ってきたか
        this._roomMemberCounts = 0; //部屋にいるプレイヤー人数
        this._hm = new HM();
        this._throwHais = document.getElementsByClassName('throw-hai');

        document.getElementById('throwButton').addEventListener('click', (event) => {
            if(!this._hm._targetElement)return;
            this.throwHai(this._hm._targetElement.innerHTML);
            this.nextPhase();
        });
    }

    set isParent(value){
        this._isParent = value;
    }

    set ownNumber(value){
        this._ownNumber = value;
    }

    set roomMemberCounts(value){
        this._roomMemberCounts = value;
    }

    gameStart(){
        for(let i = 0; i < 7; i++){
            this._hais.push(this._hm.showHai());
        }
        if(this._isParent){
            this._hais.push(this._hm.showHai());
        }

        this._scoreBord.style.opacity = '1';

        //attach
        this._hais.forEach((value) => { this._hm.attachClickEvent(value)});

        this.nextPhase();
    }

    nextPhase(){
        //点滅削除
        if(this._nowPhase != -1)this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animaction = '';

        // this._nowPhase  の更新
        this._nowPhase = (this._nowPhase + 1) % this._roomMemberCounts;

        //点滅付与
        console.log('yoba');
        console.log(this.phaseToPlayerNumber(this._nowPhase));
        console.log(this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)]);
        this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = 'blinking 2s infinite ease';

        //自分のターンなら
        if(this._nowPhase == this._ownNumber){
            document.getElementById('throwButton').style.display = 'block';
        }
        else //他の人なら
        {
            document.getElementById('throwButton').style.display = 'none';
        }
    }

    phaseToPlayerNumber(phase){
        return (2 - this._ownNumber + phase) % 4
    }

    throwHai(word){

    }
}
