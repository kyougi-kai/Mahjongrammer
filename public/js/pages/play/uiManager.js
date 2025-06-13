export class uiManager {
    constructor(playermanager) {
        this.playermanager = playermanager;
        this.throwHaiTable = document.getElementsByClassName('throw-hai-table')[0];
        this.ponskip = document.getElementsByClassName('bark-div')[0];
        this.flow = null;
        this.startButton = null;
        this.scoreBord = document.getElementById('scoreBord');

        // あなたが親なら真ん中にスタートボタン表示
        if (this.playermanager.isParent()) {
            const startbutto = document.createElement('button');
            startbutto.textContent = 'スタート';
            startbutto.style.position = 'absolute';
            startbutto.style.left = '50%';
            startbutto.style.top = '50%';
            startbutto.style.transform = 'translateX(-50%) translateY(-50%)';

            document.body.appendChild(startbutto);

            this.startButton = startbutto;
        }
    }

    setFlow(flow) {
        this.flow = flow;
        if (this.startButton != null) this.flow.setStartButton(this.startButton);
    }

    showThrowHai(hai, position) {
        console.log('捨てた牌を表示するよ！');
        this.throwHaiTable.children[position].style.opacity = '1';
        this.throwHaiTable.children[position].innerHTML = hai;
        this.throwHaiTable.children[position].children[0].style.opacity = '1';
        this.showCountDown();
    }

    showCountDown(){
        console.log(this.ponskip);
        this.ponskip.style.display = 'block';
        console.log(this.flow.nowPhaseNumber);
        console.log(this.playermanager.getPlayerNumber());
        if(this.playermanager.getPlayerNumber() == this.flow.nowPhaseNumber){
            console.log('ya');
            this.ponskip.children[0].style.display = 'none'
            this.ponskip.children[1].style.display = 'none'
        }
        else{
            this.ponskip.children[0].style.display = 'block'
            this.ponskip.children[1].style.display = 'block'
        }
        this.count = 2;
        this.ponskip.children[2].innerHTML = this.count + 1;
        const countDown = () =>{
            this.ponskip.children[2].innerHTML = this.count;
            this.count--;
        }
        this.time = setInterval(() =>{
            countDown();
            if(this.count < 0){
                clearInterval(this.time);
                this.ponskip.children[2].innerHTML = '';
                this.ponskip.style.display = 'none';
            }
        },1000);
    }

    hideNowBlink(){
        this.oldBord.style.animation = "";
    }

    showBlink(position){
        this.oldBord = this.scoreBord.children[position];
        this.scoreBord.children[position].style.animation = 'blinking 2s infinite ease';
    }

    pon(){
        
    }
}
