import { checkGrammer } from '/js/utils/grammercheck.js';

export class toGoOut {
    constructor(uimanager) {
        this.uimanager = uimanager;

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
        this.checkList = Object.keys(this.sentenceList);

        this.table = document.getElementById('wordUp');
        document.addEventListener('keydown', (e) => {
            if (e.key == 'p') {
                tumoreruka();
            }
        });
    }

    tumoreruka() {
        console.log('つもれるか？');

        // 白の数を数えて 0ならfalseを返す
        let wc = this.table.childElementCount;
        if (wc == 0) return false;

        // 1個1個白の中を見て sとかvとか 一つの文字列にまとめる  sv svo
        for (let i = 0; i < wc; i++) {
            let grammerString = '';
            Array.from(this.table.children[i].children).forEach((value) => {
                grammerString += this.grammerToString(value);
            });
            console.log(grammerString);
            // this.checkList.indexOf(this.table.children[i])
        }
    }

    grammerToString(element) {
        const checkList = [
            ['division-s', 's'],
            ['division-v', 'v'],
            ['division-o', 'o'],
            ['division-c', 'c'],
            ['division-m', 'm'],
        ];

        for (let i = 0; i < checkList.length; i++) {
            if (element.classList.contains(checkList[i][0])) {
                return checkList[i][1];
            }
        }
    }

    getGrammerData() {
        let grammerData = [];
        Array.from(this.table.children).forEach((value, index) => {
            if (!value.classList.contains('sentence-div')) return false;
            grammerData.push({});
            let grammerString = '';
            let oCount = 1;
            Array.from(value.children).forEach((val) => {
                let valString = this.grammerToString(val);
                grammerString += valString;
                if (valString == 'o') {
                    valString += oCount;
                    grammerData[index][valString] = [];
                    oCount++;
                } else grammerData[index][valString] = [];
                Array.from(val.children).forEach((word) => {
                    const p = word.querySelector('p');
                    const wordText = p ? p.textContent.trim() : '';
                    console.log(wordText);
                    grammerData[index][valString].push(wordText);
                });
            });
            if (Object.keys(this.sentenceList).indexOf(grammerString) == -1) return false;
            grammerData[index].sentence = this.sentenceList[grammerString];
        });

        return grammerData;
    }

    tumo() {
        const grammerDatas = this.getGrammerData();
        if (grammerDatas == false) {
            // 今後の処理
        } else {
            let errorFlag = false;
            grammerDatas.forEach((data) => {
                const checkResult = checkGrammer(data);
                console.log('checkResult');
                console.log(checkResult);

                if (checkResult.success == false) {
                    errorFlag = true;

                    const errorReasons = [...new Set(Object.values(checkResult.errors).map((error) => error.reason))];
                    const errordiv = document.createElement('div');
                    errordiv.innerHTML = errorReasons.join('<br>');
                    Object.assign(errordiv.style, {
                        position: 'absolute',
                        bottom: '275px',
                        left: '15%',
                        backgroundColor: 'rgba(109, 109, 109, 0.4)',
                        color: '#FFFFFF',
                        border: '2px solid #000000',
                        zIndex: 9999,
                        fontSize: '24px',
                        opacity: '1',
                        borderRadius: '10px',
                        transition: 'opacity 0.5s ease',
                        padding: '10px',
                        maxWidth: '60%',
                    });
                    document.body.appendChild(errordiv);

                    const displayDuration = 2000 + errorReasons.length * 1000;

                    setTimeout(() => {
                        errordiv.style.opacity = '0';
                        errordiv.addEventListener('transitionend', () => errordiv.remove(), { once: true });
                    }, displayDuration);
                }
            });

            return !errorFlag;
        }
    }
}
