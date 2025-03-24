import { DM } from '/js/until/DataManager.js' 

class HaiMG{
    constructor(){
        this._dm = new DM();
        this._draggedElement = null;
        this._targetElement = null;
        this._clickFlag = false;
        this._idCounter = 0;

        document.querySelectorAll('.hai-table').forEach(parent => {
            parent.addEventListener('dragover',function(event){
                event.preventDefault();//ドロップの可能
                if (!this._draggedElement) return;
                const elements = [...document.querySelectorAll('.border-div')];//border-divを持っているすべての要素を取得
                elements.forEach(el => {
                    if (el !== this._draggedElement) {//自分はチェックしない
                        const rect = el.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        /*
                        座標情報を所得
                        xの中心centerX
                        */
                        if (
                            event.clientX > rect.left &&
                            event.clientX < rect.right &&
                            event.clientY > rect.top &&
                            event.clientY < rect.bottom
                            /*
                            event.clientがマウスのX,Y
                            重なっているかの判定
                            */
                        ) {
                            if (event.clientX < centerX) {
                                el.parentNode.insertBefore(this._draggedElement, el);
                            } else {
                                el.parentNode.insertBefore(this._draggedElement, el.nextSibling);
                            }
                            /*
                            ドラッグしている要素 (draggedElement) のマウス位置が、重なった要素 (el) の中心より左か右かを判定
                            event.clientX < centerX → マウスが el の左側
                            → draggedElement を el の前に挿入
                            event.clientX >= centerX → マウスが el の右側
                            → draggedElement を el の次に挿入
                            */
                        }
                    }
                });
            });
            parent.addEventListener('drop',function(event) {
                event.preventDefault();
                if(this._draggedElement){
                    parent.appendChild(this._draggedElement);//親に追加
                    this._draggedElement.style.opacity = '1';
                    this._draggedElement = null;
                }
            });
        });
    }

    showHai(){
        const borderDiv = document.createElement('div');
        borderDiv.classList.add('border-div');
        // _dm.pickTango() で単語が取れる
        borderDiv.textContent = this._dm.pickTango();
        // ドラッグアンドドロップを有効にする
        borderDiv.setAttribute('draggable', 'true');
        borderDiv.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', event.target.id);
            this._draggedElement = event.target;
            setTimeout(() => event.target.style.opacity = '0.25', 0); // ドラッグ中は透明に
        });
        borderDiv.addEventListener('dragend', function(event) {
            if(this._draggedElement)this._draggedElement.style.opacity = '1'; // ドラッグ終了時に元に戻す
            this._draggedElement = null;
        });
        document.getElementById('wordDown').appendChild(borderDiv);

        //選択処理
    
        return borderDiv;
    }

    changeClickMode(){
        if(this._clickFlag){
            this._clickFlag = false;
        }
        else{
            this._clickFlag = true;
        }
    }
}

export default class gameManager{
    constructor(){
        this._hais = [];
        this._isParent = false;
        this._scoreBord = document.getElementById('scoreBord');
        this._nowPhase = -1; // 0が親 0~3の数字で回す
        this._ownNumber = -1; //自分が部屋に何番目に入ってきたか
        this._roomMemberCounts = 0; //部屋にいるプレイヤー人数
        this._hm = new HaiMG();
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
        this.nextPhase();
    }

    nextPhase(){
        //点滅削除
        if(this._nowPhase != -1)this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animaction = '';

        // this._nowPhase  の更新
        this._nowPhase = (this._nowPhase + 1) % 4;

        //点滅付与
        console.log('yoba');
        console.log(this.phaseToPlayerNumber(this._nowPhase));
        console.log(this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)]);
        this._scoreBord.children[this.phaseToPlayerNumber(this._nowPhase)].style.animation = 'blinking 2s infinite ease';
    }

    phaseToPlayerNumber(phase){
        return (2 - this._ownNumber + phase) % 4
    }
}
