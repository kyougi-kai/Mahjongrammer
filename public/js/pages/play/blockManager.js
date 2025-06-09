export class blockManager {
    constructor() {
        this.flow = null;

        this.movedAnotherParent = false;
        this.draggedElement = null;
        this.originalParent = null;
        this.wordDown = document.getElementById('wordDown');
        this.haiTables = Array.from(document.getElementsByClassName('hai-table'));
        this.sentencePatterns = Array.from(document.getElementById('sentencePattern').children);
        this.divisions = document.getElementsByClassName('division-div');

        this.sentencePatterns.forEach((value) => {
            const temporaryDiv = document.createElement('div');
            temporaryDiv.classList.add('division-div');
            temporaryDiv.classList.add(`division-${value.textContent.toLowerCase()}`);
            this.attachDraggable(value, temporaryDiv);
        });

        this.haiTables.forEach((value) => {
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

        document.addEventListener('drop', (event) => {
            console.log(this.draggedElement);
            event.preventDefault();
            if (this.draggedElement.classList.contains('border-div')) {
                console.log('捨てたよ');
                this.flow.throw(this.draggedElement);
            } else {
                let words = this.draggedElement.getElementsByClassName('border-div');
                Array.from(words).forEach((value) => {
                    this.wordDown.appendChild(value);
                });

                if (!this.draggedElement.classList.contains('border-div')) this.draggedElement.remove();

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

    setFlow(flow) {
        this.flow = flow;
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
            this.movedAnotherParent = false;

            if (dragElement == null) {
                this.draggedElement = event.target;
            } else {
                const dragElementCopy = dragElement.cloneNode(true);
                this.draggedElement = dragElementCopy;
                this.attachDraggable(this.draggedElement);
                dragElement.classList.contains('division-m')
                    ? this.attachDraggabled(this.draggedElement, ['division-div', 'sentence-div'])
                    : this.attachDraggabled(this.draggedElement, ['division-s', 'division-v', 'division-c', 'division-o', 'sentence-div']);
            }
            setTimeout(() => (this.draggedElement.style.opacity = '0.25'), 1);
            this.originalParent = this.draggedElement.parentNode; // ドラッグ開始時の親要素を保存
        });

        targetElement.addEventListener('dragend', (event) => {
            event.stopPropagation(); //親要素に伝播しないようにする
            if (!this.draggedElement) return;
            this.draggedElement.style.opacity = '1'; // ドラッグ終了時に元に戻す
            this.draggedElement = null;
        });
    }

    // excludeClassは配列でもいいよ
    attachDraggabled(targetElement, excludeClass) {
        targetElement.addEventListener('dragover', (event) => {
            event.preventDefault(); //ドロップの可能
            if (!this.draggedElement || excludeClass?.some((value) => this.draggedElement?.classList.contains(value))) return;
            event.stopPropagation();

            const childrenCount = Array.from(targetElement.children).length;
            if (childrenCount == 0 || event.clientX > targetElement.children[childrenCount - 1]?.getBoundingClientRect().right) {
                targetElement.appendChild(this.draggedElement);
            }
            Array.from(targetElement.children).forEach((hai) => {
                if (hai !== this.draggedElement) {
                    //自分はチェックしない
                    let rect = hai.getBoundingClientRect();
                    if (event.clientX > rect.left && event.clientX < rect.right && event.clientY > rect.top && event.clientY < rect.bottom) {
                        /*
								event.clientがマウスのX,Y
								重なっているかの判定
								*/
                        const idx = Array.from(targetElement.children).indexOf(hai);
                        console.log(idx);
                        console.log(Array.from(targetElement.children).indexOf(this.draggedElement));
                        if (!this.movedAnotherParent && this.originalParent != hai.parentNode) {
                            hai.parentNode.insertBefore(this.draggedElement, hai);
                        } else if (idx > Array.from(targetElement.children).indexOf(this.draggedElement)) {
                            hai.parentNode.insertBefore(this.draggedElement, hai.nextSibling);
                        } else {
                            hai.parentNode.insertBefore(this.draggedElement, hai);
                        }

                        if (this.originalParent != hai.parentNode) this.movedAnotherParent = true;
                    }
                }
            });
        });
        targetElement.addEventListener('drop', (event) => {
            event.stopPropagation(); //親要素に伝播しないようにする
            event.preventDefault();
            if (this.draggedElement) {
                this.draggedElement.style.opacity = '1';

                //くくりを作る
                if (this.draggedElement.classList.contains('division-div') && this.draggedElement.parentElement.classList.contains('hai-table')) {
                    const temporarySentence = document.createElement('div');
                    temporarySentence.classList.add('sentence-div');
                    this.draggedElement.parentElement.appendChild(temporarySentence);
                    this.attachDraggable(temporarySentence);
                    this.attachDraggabled(temporarySentence, ['sentence-div', 'border-div']);
                    temporarySentence.appendChild(this.draggedElement);
                }

                this.draggedElement = null;

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
