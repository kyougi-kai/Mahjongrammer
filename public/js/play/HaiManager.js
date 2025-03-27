export class HM{
    constructor(throwEvent){
        this._idCounter = 0;
        this._draggedElement = null;
        this._originalParent = null;
        this._movedAnotherParent = false;

        this._isMyTurn = false;
        this._isBark = false;

        document.querySelectorAll('.hai-table').forEach((parent, index) => {
            parent.addEventListener('dragover', event => {
                event.preventDefault();//ドロップの可能
                if (!this._draggedElement) return;

                const childrenCount = Array.from(parent.children).length;
                if(childrenCount == 0 || event.clientX > parent.children[childrenCount - 1]?.getBoundingClientRect().right){
                    parent.appendChild(this._draggedElement);
                }

                    Array.from(parent.children).forEach((hai) => {
                        if (hai !== this._draggedElement) {//自分はチェックしない
                            let rect = hai.getBoundingClientRect();
                            if (event.clientX > rect.left && event.clientX < rect.right && event.clientY > rect.top && event.clientY < rect.bottom) {
                                 /*
                                event.clientがマウスのX,Y
                                重なっているかの判定
                                */
                                const idx = Array.from(parent.children).indexOf(hai);
                                console.log(idx);
                                console.log(Array.from(parent.children).indexOf(this._draggedElement));
                                if(!this._movedAnotherParent && this._originalParent != hai.parentNode){
                                    hai.parentNode.insertBefore(this._draggedElement, hai);
                                }
                                else if(idx > Array.from(parent.children).indexOf(this._draggedElement)){
                                    hai.parentNode.insertBefore(this._draggedElement, hai.nextSibling);
                                }
                                else{
                                    hai.parentNode.insertBefore(this._draggedElement, hai);
                                }

                                if(this._originalParent != hai.parentNode)this._movedAnotherParent = true;
                            }
                        }
                    })
            });
            parent.addEventListener('drop', event => {
                event.preventDefault();
                if(this._draggedElement){
                    this._draggedElement.style.opacity = '1'
                    this._draggedElement = null;
                }
            });
        });

        document.addEventListener('dragover', event => {
            event.preventDefault();
        });

        //捨てる
        document.addEventListener('drop', event => {
            event.preventDefault();
            if (this._draggedElement && (this._isMyTurn || this._isBark)){
                let saveData = this._draggedElement.textContent;
                this._draggedElement.remove();
                throwEvent(saveData, this._isBark);
                this._isMyTurn = false;
                this._isBark = false;
            }
        });
    }

    set isMyTurn(value){
        this._isMyTurn = value;
    }

    set isBark(value){
        this._isBark = value;
    }

    showHai(word){
        const borderDiv = document.createElement('div');
        borderDiv.classList.add('border-div');
        // _dm.pickTango() で単語が取れる
        borderDiv.textContent = word;
        // ドラッグアンドドロップを有効にする
        borderDiv.setAttribute('draggable', 'true');
        borderDiv.id = `hai-${this._idCounter++}`;//なくてもOK　必要になるときがあるかも？

        borderDiv.addEventListener('dragstart', event => {
            this._movedAnotherParent = false;
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
}
