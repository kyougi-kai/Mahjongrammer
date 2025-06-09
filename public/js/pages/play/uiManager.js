export class uiManager {
    constructor(playermanager) {
        this.playermanager = playermanager;
        this.throwHaiTable = document.getElementsByClassName('throw-hai-table')[0];
        this.flow = null;

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

    removeStartButton() {
        this.startButton.remove();
    }

    setFlow(flow) {
        this.flow = flow;
        this.startButton.addEventListener('click', this.flow.sendStart);
    }

    showThrowHai(hai, position) {}
}
