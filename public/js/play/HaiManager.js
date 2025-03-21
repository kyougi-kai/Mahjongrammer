import { DM } from '/js/until/DataManager.js'

const _dm = new DM();
let idCounter = 0;
let draggedElement = null; 
export function showHai() {
    const borderDiv = document.createElement('div');
    borderDiv.classList.add('border-div');
    // _dm.pickTango() で単語が取れる
    borderDiv.textContent = _dm.pickTango();
    // ドラッグアンドドロップを有効にする
    borderDiv.setAttribute('draggable', 'true');
    borderDiv.id = `hai-${idCounter++}`;//なくてもOK　必要になるときがあるかも？
    borderDiv.addEventListener('dragstart', function(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
        draggedElement = event.target;
        setTimeout(() => event.target.style.opacity = '0.25', 0); // ドラッグ中は透明に
    });
    borderDiv.addEventListener('dragend', function(event) {
        if(draggedElement)draggedElement.style.opacity = '1'; // ドラッグ終了時に元に戻す
        draggedElement = null;
    });
    document.getElementById('wordDown').appendChild(borderDiv);

    return borderDiv;
}

document.querySelectorAll('.hai-table').forEach(parent => {
    parent.addEventListener('dragover',function(event){
        event.preventDefault();//ドロップの可能
        if (!draggedElement) return;
        const elements = [...document.querySelectorAll('.border-div')];//border-divを持っているすべての要素を取得
        elements.forEach(el => {
            if (el !== draggedElement) {//自分はチェックしない
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
                        el.parentNode.insertBefore(draggedElement, el);
                    } else {
                        el.parentNode.insertBefore(draggedElement, el.nextSibling);
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
        if(draggedElement){
            parent.appendChild(draggedElement);//親に追加
            draggedElement.style.opacity = '1';
            draggedElement = null;
        }
    });
});

class gameManager{
    constructor(){
        this._hais = [];
    }

    gameStart(){
        for(let i = 0; i < 7; i++){
            this._hais.push(showHai());
        }
        if(isParent){
            this._hais.push(showHai());
        }
    }
}
