import DM from '/js/until/dataManager.js';

export default class HM{
    constructor(){
        this._dm = new DM();
        this._idCounter = 0;
        this._draggedElement = null;
        this._originalParent = null;

        //クリック
        this._targetElement = null;

        document.querySelectorAll('.hai-table').forEach(parent => {
            parent.addEventListener('dragover', event => {
                event.preventDefault();//ドロップの可能
                if (!this._draggedElement) return;
                const elements = [...document.querySelectorAll('.border-div')];//border-divを持っているすべての要素を取得

                elements.forEach(el => {
                    if (el !== this._draggedElement) {//自分はチェックしない
                        let rect = el.getBoundingClientRect();
                        let centerX = rect.left + rect.width / 2;
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

            parent.addEventListener('drop', event => {
                event.preventDefault();
                if(this._draggedElement){
                // 親が異なり、かつその親の子要素数が0の場合のみ、親要素に追加
                    if(parent !== this._originalParent && parent.children.length === 0){
                        parent.appendChild(this._draggedElement);
                    }
                    this._draggedElement.style.opacity = '1'
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
        borderDiv.id = `hai-${this._idCounter++}`;//なくてもOK　必要になるときがあるかも？

        borderDiv.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', event.target.id);
            this._draggedElement = event.target;
            this._originalParent = this._draggedElement.parentNode; // ドラッグ開始時の親要素を保存
            setTimeout(() => event.target.style.opacity = '0.25', 0); // ドラッグ中は透明に
            console.log(this._draggedElement);
        });

        borderDiv.addEventListener('dragend', event => {
            if(!this._draggedElement)return;
            this._draggedElement.style.opacity = '1'; // ドラッグ終了時に元に戻す
            this._draggedElement = null;
        });

        document.getElementById('wordDown').appendChild(borderDiv);

        return borderDiv;
    }

    attachClickEvent(element){
        element.addEventListener('click', (event) => {
            if(this._targetElement)this._targetElement.style.border = '';

            this._targetElement = event.target;
            this._targetElement.style.border = '2px solid red';
        });
    }
}