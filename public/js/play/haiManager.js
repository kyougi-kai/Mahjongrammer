export class HM{
    constructor(throwEvent){
        this._idCounter = 0;
        this._draggedElement = null;
        this._originalParent = null;
        this._movedAnotherParent = false;
        this._selectionDiv = document.getElementById('selectionDiv');
        this._divisions = document.getElementsByClassName('division-div');
        this._wordUpRight = document.getElementById('wordUpRight');
        this._wordDown = document.getElementById('wordDown');

        Array.from(this._selectionDiv.children).forEach((value) => {
            value.addEventListener('click', (event) => {
                console.log('yobareta');
                const targetText = (event.target.textContent);
                this.showDivision(targetText.split(''));
                this.changeCondition(this._selectionDiv);
                this.changeCondition(this._wordUpRight, true);
            });
        });

        this._isMyTurn = false;
        this._isBark = false;

        //リセットボタン
        this._wordUpRight.children[0].addEventListener('click', (event) => {
            Array.from(this._divisions).forEach(element => {
                if(element.style.opacity = '1'){
                    while(Array.from(element.children).length != 0){
                        this._wordDown.appendChild(element.children[0]);
                    }
                    this.changeCondition(element);
                }
            });

            this.changeCondition(this._selectionDiv);
            this.changeCondition(this._wordUpRight, true);
        });

        const draggBoxList = Array.from(this._divisions).concat(this._wordDown);
        draggBoxList.forEach((parent, index) => {
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
                throwEvent(this._draggedElement.outerHTML, this._isBark);
                this._draggedElement.remove();
                this._isMyTurn = false;
                this._isBark = false;
            }
        });
    }

    get divisions(){
        return this._divisions;
    }

    /**
     * @param {string[]} targetPOS 
     */
    showDivision(targetPOS){
        let numOfO = 0;
        this.changeCondition(this._divisions[0]);
        this.changeCondition(this._divisions[1]);
        targetPOS.forEach(value => {
            switch(value){
                case 'C':
                    this.changeCondition(this._divisions[2]);
                    break;
                case 'O':
                    this.changeCondition(this._divisions[3 + numOfO]);
                    numOfO++;
                    break;
            }
        });
    }

    changeCondition(element, dontChangePosition = false){
        if(element.style.opacity == '0'){
            element.style.opacity = '1';
            if(!dontChangePosition)element.style.position = 'relative';
            element.style.pointerEvents = 'all';
            element.style.zIndex = '0';
        }
        else{
            element.style.opacity = '0';
            if(!dontChangePosition)element.style.position = 'absolute';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '-1';
        }
    }

    set isMyTurn(value){
        this._isMyTurn = value;
    }

    set isBark(value){
        this._isBark = value;
    }

    showHai(word, partOfSpeech){
        const borderDiv = document.createElement('div');
        const wordP = document.createElement('p');
        borderDiv.classList.add('border-div');

        wordP.textContent = word;
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

        //画像
        borderDiv.style.backgroundImage = `url(/img/partOfSpeech/${partOfSpeech}.png)`;

        borderDiv.appendChild(wordP);
        document.getElementById('wordDown').appendChild(borderDiv);

        return borderDiv;
    }

    gameStart(){
        this.changeCondition(this._selectionDiv);
    }
}
