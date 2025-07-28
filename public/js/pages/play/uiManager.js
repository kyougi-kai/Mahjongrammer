import { tango } from '/js/utils/wordData.js';

export class uiManager {
    constructor(playermanager) {
        this.playermanager = playermanager;
        this.throwHaiTable = document.getElementsByClassName('throw-hai-table')[0];
        this.ponskip = document.getElementsByClassName('bark-div')[0];
        this.flow = null;
        this.scoreBord = document.getElementById('scoreBord');

        // チートdiv
        this.hinsiDiv = document.getElementById('hinsiDrop');
        this.tagDiv = document.getElementById('tagDrop');
        let hinsiList = [];
        Object.values(tango).forEach((value) => {
            value.hinsi.forEach((val) => {
                if (hinsiList.indexOf(val) == -1) {
                    hinsiList.push(val);
                }
            });
        });

        hinsiList.forEach((value) => {
            let temporary = document.createElement('option');
            temporary.setAttribute('value', value);
            temporary.innerHTML = value;
            this.hinsiDiv.appendChild(temporary);
        });

        const changeTag = () => {
            this.tagDiv.innerHTML = '';
            let tagList = [];
            Object.values(tango).forEach((word) => {
                if (word.hinsi.indexOf(this.hinsiDiv.value) != -1) {
                    word.tags.forEach((tag) => {
                        if (tagList.indexOf(tag) == -1) {
                            tagList.push(tag);
                        }
                    });
                }
            });
            console.log(tagList);

            tagList.forEach((tag) => {
                let temporary = document.createElement('option');
                temporary.setAttribute('value', tag);
                temporary.innerHTML = tag;
                this.tagDiv.appendChild(temporary);
            });
        };

        changeTag();

        this.hinsiDiv.addEventListener('change', (e) => {
            changeTag();
        });

        document.getElementById('pickButton').addEventListener('click', () => {
            document.getElementById('cheatDiv').style.display = 'none';

            let pickWordList = [];
            Object.keys(tango).forEach((word) => {
                if (tango[word].hinsi.indexOf(this.hinsiDiv.value) != -1 && tango[word].tags.indexOf(this.tagDiv.value) != -1) {
                    pickWordList.push(word);
                }
            });

            let pickWord = pickWordList[Math.floor(Math.random() * pickWordList.length)];
            this.flow.drawHai(pickWord);
        });
    }

    showCheatDiv() {
        document.getElementById('cheatDiv').style.display = 'block';
    }

    setFlow(flow) {
        this.flow = flow;
    }

    showThrowHai(hai, position) {
        console.log('捨てた牌を表示するよ！');
        this.throwHaiTable.children[position].style.opacity = '1';
        this.throwHaiTable.children[position].innerHTML = hai;
        this.throwHaiTable.children[position].children[0].style.opacity = '1';
        this.showCountDown();
    }

    initTable() {
        document.getElementById('wordUp').innerHTML = '';
        document.getElementById('wordDown').innerHTML = '';
    }

    hideThrowHai(position) {
        this.throwHaiTable.children[position].children[0].remove();
    }

    showRoundResult(grammerData) {
        document.getElementById('resultpage').style.display = 'flex';
        document.getElementById('resultGrammerDiv').innerHTML = grammerData;
    }

    hideRoundResult() {
        document.getElementById('resultpage').style.display = 'none';
    }

    showCountDown() {
        console.log(this.ponskip);
        this.ponskip.style.display = 'block';
        console.log(this.flow.nowPhaseNumber);
        console.log(this.playermanager.getPlayerNumber());
        if (this.playermanager.getPlayerNumber() == this.flow.nowPhaseNumber) {
            console.log('ya');
            this.ponskip.children[0].style.display = 'none';
            this.ponskip.children[1].style.display = 'none';
        } else {
            this.ponskip.children[0].style.display = 'block';
            this.ponskip.children[1].style.display = 'block';
        }
        this.count = 2;
        this.ponskip.children[2].innerHTML = this.count + 1;
        const countDown = () => {
            this.ponskip.children[2].innerHTML = this.count;
            this.count--;
        };
        this.time = setInterval(() => {
            countDown();
            if (this.count < 0) {
                clearInterval(this.time);
                this.ponskip.children[2].innerHTML = '';
                this.ponskip.style.display = 'none';
            }
        }, 1000);
    }

    hideNowBlink() {
        this.oldBord.style.animation = '';
    }

    showBlink(position) {
        this.oldBord = this.scoreBord.children[position];
        this.scoreBord.children[position].style.animation = 'blinking 2s infinite ease';
    }

    hideponskip() {
        this.ponDiv = this.ponskip.children[0];
        this.skipDiv = this.ponskip.children[1];
        this.ponDiv.style.display = 'none';
        this.skipDiv.style.display = 'none';
    }

    pon() {
        this.ponskip.style.display = 'none';
        clearTimeout(this.time);
    }
}
