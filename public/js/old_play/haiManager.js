export class HM {
    _draggedElement;
    _originalParent;
    _movedAnotherParent;
    _idCount;

    constructor(throwEvent) {
        this._sentencePatterns = Array.from(document.getElementById('sentencePattern').children);
        this._divisions = document.getElementsByClassName('division-div');
        this._wordDown = document.getElementById('wordDown');
        this._haiTables = Array.from(document.getElementsByClassName('hai-table'));

        this._isMyTurn = false;
        this._isBark = false;
        this._idCount = 0;

        this._sentencePatterns.forEach((value) => {
            const temporaryDiv = document.createElement('div');
            temporaryDiv.classList.add('division-div');
            temporaryDiv.classList.add(`division-${value.textContent.toLowerCase()}`);
            this.attachDraggable(value, temporaryDiv);
        });

        this._haiTables.forEach((value) => {
            this.attachDraggabled(value);
        });

        this.sentenceList = {
            sv: 1,
            svm: 1,
            svc: 2,
            svcm: 2,
            svo: 3,
            svom: 3,
            svoo: 4,
            svoom: 4,
            svoc: 5,
            svocm: 5,
        };

        //捨てる
        document.addEventListener('drop', (event) => {
            console.log(this._draggedElement);
            event.preventDefault();
            if (this._draggedElement.classList.contains('border-div') && (this._isMyTurn || this._isBark)) {
                console.log('捨てたよ');
                throwEvent(this._draggedElement.outerHTML, this._isBark);
                this._draggedElement.remove();
                this._isMyTurn = false;
                this._isBark = false;
            } else {
                let words = this._draggedElement.getElementsByClassName('border-div');
                Array.from(words).forEach((value) => {
                    this._wordDown.appendChild(value);
                });

                if (!this._draggedElement.classList.contains('border-div')) this._draggedElement.remove();

                const sentenceDivs = document.getElementsByClassName('sentence-div');
                Array.from(sentenceDivs).forEach((value) => {
                    console.log(value);
                    if (!value.children[0]) value.remove();
                });
            }

        });

        document.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
    }

    get divisions() {
        return this._divisions;
    }

    /**
     * @param {string[]} targetPOS
     */
    showDivision(targetPOS) {
        let numOfO = 0;
        this.changeCondition(this._divisions[0]);
        this.changeCondition(this._divisions[1]);
        targetPOS.forEach((value) => {
            switch (value) {
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

    changeCondition(element, dontChangePosition = false) {
        if (element.style.opacity == '0') {
            element.style.opacity = '1';
            if (!dontChangePosition) element.style.position = 'relative';
            element.style.pointerEvents = 'all';
            element.style.zIndex = '0';
        } else {
            element.style.opacity = '0';
            if (!dontChangePosition) element.style.position = 'absolute';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '-1';
        }
    }

    set isMyTurn(value) {
        this._isMyTurn = value;
    }

    get isMyTurn() {
        return this._isMyTurn;
    }

    set isBark(value) {
        this._isBark = value;
    }

    get isBark() {
        return this._isBark;
    }

    showHai(word, partOfSpeech) {
        const borderDiv = document.createElement('div');
        const wordP = document.createElement('p');
        borderDiv.classList.add('border-div');

        wordP.textContent = word;

        // ドラッグアンドドロップを有効にする
        this.attachDraggable(borderDiv);

        //画像
        borderDiv.style.backgroundImage = `url(/img/partOfSpeech/${partOfSpeech}.png)`;

        //原型id
        borderDiv.id = `${this._idCount}-${word}`;

        borderDiv.appendChild(wordP);
        document.getElementById('wordDown').appendChild(borderDiv);

        return borderDiv;
    }

    attachDetailButton() {}

    sentenceCheck() {
        const targetElements = Array.from(this._haiTables[0].children);
        if (targetElements.length == 0) return false;

        let returnSentences = [];
        //白いやつのforEach
        targetElements.forEach((element) => {
            if (element.classList.contains('border-div')) return false;

            let targetSentence = '';
            let targetWords = {};
            let oCount = 0;
            // SとかVとかのforEach
            Array.from(element.children).forEach((part) => {
                let partType = part.getAttribute('class').substring(part.getAttribute('class').length - 1);
                targetSentence += partType;
                if (partType == 'o') {
                    oCount++;
                    targetWords[partType + oCount] = [];
                } else targetWords[partType] = [];

                // Sの中の単語のforEach
                Array.from(part.children).forEach((word) => {
                    // mの中のforEach
                    if (word.classList.contains('division-m')) {
                        let temporaryList = [];
                        Array.from(word.children).forEach((wwww) => {
                            temporaryList.push(wwww.children[0].textContent);
                        });
                        targetWords[partType == 'o' ? partType + oCount : partType].push(temporaryList);
                    } else targetWords[partType == 'o' ? partType + oCount : partType].push(word.children[0].textContent);
                });
            });

            console.log(targetSentence);

            targetWords.sentence = this.sentenceList.hasOwnProperty(targetSentence) ? this.sentenceList[targetSentence] : -1;

            returnSentences.push(targetWords);
        });

        return returnSentences;
    }

    /**
     *
     * @param {HTMLElement} targetElement -ドラッグを可能にする要素-
     * @param {HTMLElement} dragElement -ドラッグしているときマウスポインターについてくる要素(省略可)-
     */
    attachDraggable(targetElement, dragElement = null) {
        targetElement.setAttribute('draggable', 'true');

        targetElement.addEventListener('dragstart', (event) => {
            event.stopPropagation(); //親要素に伝播しないようにする
            this._movedAnotherParent = false;

            if (dragElement == null) {
                this._draggedElement = event.target;
            } else {
                const dragElementCopy = dragElement.cloneNode(true);
                this._draggedElement = dragElementCopy;
                this.attachDraggable(this._draggedElement);
                dragElement.classList.contains('division-m')
                    ? this.attachDraggabled(this._draggedElement, ['division-div', 'sentence-div'])
                    : this.attachDraggabled(this._draggedElement, ['division-s', 'division-v', 'division-c', 'division-o', 'sentence-div']);
            }
            setTimeout(() => (this._draggedElement.style.opacity = '0.25'), 1);
            this._originalParent = this._draggedElement.parentNode; // ドラッグ開始時の親要素を保存
        });

        targetElement.addEventListener('dragend', (event) => {
            event.stopPropagation(); //親要素に伝播しないようにする
            if (!this._draggedElement) return;
            this._draggedElement.style.opacity = '1'; // ドラッグ終了時に元に戻す
            this._draggedElement = null;
        });
    }

    attachDraggabled(targetElement, excludeClass) {
        targetElement.addEventListener('dragover', (event) => {
            event.preventDefault(); //ドロップの可能
            if (!this._draggedElement || excludeClass?.some((value) => this._draggedElement?.classList.contains(value))) return;
            event.stopPropagation();

            const childrenCount = Array.from(targetElement.children).length;
            if (childrenCount == 0 || event.clientX > targetElement.children[childrenCount - 1]?.getBoundingClientRect().right) {
                targetElement.appendChild(this._draggedElement);
            }
            Array.from(targetElement.children).forEach((hai) => {
                if (hai !== this._draggedElement) {
                    //自分はチェックしない
                    let rect = hai.getBoundingClientRect();
                    if (event.clientX > rect.left && event.clientX < rect.right && event.clientY > rect.top && event.clientY < rect.bottom) {
                        /*
								event.clientがマウスのX,Y
								重なっているかの判定
								*/
                        const idx = Array.from(targetElement.children).indexOf(hai);
                        console.log(idx);
                        console.log(Array.from(targetElement.children).indexOf(this._draggedElement));
                        if (!this._movedAnotherParent && this._originalParent != hai.parentNode) {
                            hai.parentNode.insertBefore(this._draggedElement, hai);
                        } else if (idx > Array.from(targetElement.children).indexOf(this._draggedElement)) {
                            hai.parentNode.insertBefore(this._draggedElement, hai.nextSibling);
                        } else {
                            hai.parentNode.insertBefore(this._draggedElement, hai);
                        }

                        if (this._originalParent != hai.parentNode) this._movedAnotherParent = true;
                    }
                }
            });
        });
        targetElement.addEventListener('drop', (event) => {
            event.stopPropagation(); //親要素に伝播しないようにする
            event.preventDefault();
            if (this._draggedElement) {
                this._draggedElement.style.opacity = '1';

                //くくりを作る
                if (this._draggedElement.classList.contains('division-div') && this._draggedElement.parentElement.classList.contains('hai-table')) {
                    const temporarySentence = document.createElement('div');
                    temporarySentence.classList.add('sentence-div');
                    this._draggedElement.parentElement.appendChild(temporarySentence);
                    this.attachDraggable(temporarySentence);
                    this.attachDraggabled(temporarySentence, ['sentence-div', 'border-div']);
                    temporarySentence.appendChild(this._draggedElement);
                }

                this._draggedElement = null;

                const sentenceDivs = document.getElementsByClassName('sentence-div');
                Array.from(sentenceDivs).forEach((value) => {
                    console.log(value);
                    if (!value.children[0]) value.remove();
                });
            }
        });

        targetElement.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
    }
}


