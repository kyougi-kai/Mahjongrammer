export class toGoOut {
    constructor(uimanager, connectionmanager, playermanager) {
        this.uimanager = uimanager;
        this.wss = connectionmanager;
        this.playermanager = playermanager;

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

        this.wss.onMessage('grammerError', (data) => {
            if (data.result.errors === '文法がめちゃくちゃ') this.uimanager.errorbox('文法がめちゃくちゃです。やり直してください。');
            else this.uimanager.errorbox([...new Set(Object.values(data.result.errors).map((error) => error.reason))]);
            // this.uimanager.errorbox(data.payload.errors);
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
        let wordsCount = 0;
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
                    if (word.classList.contains('division-m')) {
                        let mw = [];
                        Array.from(word.children).forEach((mWords) => {
                            const p = mWords.querySelector('p');
                            const wordText = p ? p.textContent.trim() : '';
                            console.log(wordText);
                            mw.push(wordText);
                            wordsCount++;
                        });
                        grammerData[index][valString].push(mw);
                    } else {
                        const p = word.querySelector('p');
                        const wordText = p ? p.textContent.trim() : '';
                        console.log(wordText);
                        grammerData[index][valString].push(wordText);
                        wordsCount++;
                    }
                });
            });
            if (Object.keys(this.sentenceList).indexOf(grammerString) == -1) return false;
            grammerData[index].sentence = this.sentenceList[grammerString];
        });

        // 上がるときの下限
        if (wordsCount < 5) {
            grammerData = false;
            this.uimanager.errorbox('5単語を超えていません');
        }

        return grammerData;
    }

    getGrammerDataNew() {
        let resultSentence = '';
        Array.from(this.uimanager.wordUp.children).forEach((value, index) => {
            console.log(value);
            console.log(value.children[0].textContent.trim());
            resultSentence += value.children[0].textContent.trim() + ' ';
        });
        console.log(resultSentence);
        return resultSentence;
    }

    tumo() {
        const sentence = this.getGrammerDataNew();
        const sendData = {
            type: 'grammerCheck',
            payload: {
                userId: this.playermanager.userId,
                roomId: this.playermanager.roomId,
                sentence: sentence,
                grammerData: this.uimanager.wordUp.innerHTML,
                playerNumber: this.playermanager.getPlayerNumber(),
            },
        };
        this.wss.send(sendData);

        /* つもの処理

        this.finishbutton.style.display = 'none';
                

        */

        /*
        if (grammerDatas == false) {
            // 今後の処理
            return 0;
        } else {
            let errorFlag = false;
            // 左ポイント　右英語
            let result = [[], []];
            let flatWords = [];
            let point = 0;
            grammerDatas.forEach((data) => {
                let temporaryList = Object.values(data).flat();
                temporaryList.pop();
                flatWords.push(temporaryList);
                const checkResult = checkGrammer(data);
                console.log('checkResult');
                console.log(checkResult);

                if (checkResult.success == false) {
                    errorFlag = true;

                    this.uimanager.errorbox([...new Set(Object.values(checkResult.errors).map((error) => error.reason))]);
                } else {
                    const pointDetails = Object.values(checkResult.points)
                        .map((point) => `${point.pointName}:${point.pointValue}`)
                        .join(' ');
                    console.log(`得点内訳: ${pointDetails}`);
                    result[0].push(pointDetails);

                    Object.values(checkResult.points).forEach((value) => {
                        point += Object.values(value)[1];
                    });
                }
            });

            console.log('point', point);
            result[1] = flatWords;

            if (errorFlag || point < 1000) result = [];
            console.log(result);
            return result;
            
        }
        */
    }
}
