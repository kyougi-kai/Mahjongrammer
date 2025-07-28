export class actionManager {
    constructor(wss, playermanager) {
        this.wss = wss;
        this.playermanager = playermanager;
        this.readyBtn = document.getElementById('readyBtn');
        this.startBtn = document.getElementById('startBtn');
        this.chatInput = document.getElementById('chat-input');
        this.isReady = false;
        this.setup();
    }

    setup() {
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                this.sendChatMessage();
            }
        });

        document.getElementById('sendButton').addEventListener('click', (e) => {
            this.sendChatMessage();
        });

        this.readyBtn.addEventListener('click', (e) => {
            if (this.isReady) {
                this.sendReadyMessage(false);
                this.readyBtn.classList.remove('btn-unready');
                this.readyBtn.classList.add('btn-ready');
                this.readyBtn.innerHTML = '準備完了';
            } else {
                this.sendReadyMessage(true);
                this.readyBtn.classList.add('btn-unready');
                this.readyBtn.classList.remove('btn-ready');
                this.readyBtn.innerHTML = 'キャンセル';
            }

            this.isReady = !this.isReady;
        });

        this.wss.onMessage('sendChat', (data) => {
            const chatText = document.createElement('div');
            chatText.innerHTML = `<strong>${this.playermanager.playerMembers[data.userId]}:</strong> ${data.text}`;
            document.getElementById('chat-box').appendChild(chatText);
        });

        this.wss.onMessage('changeIsReady', (data) => {
            this.changeIsReady(data.userId, data.isReady);
        });

        this.startBtn.addEventListener('click', (e) => {
            const sendData = {
                type: 'moveToPlay',
                payload: {
                    roomId: this.playermanager.roomId,
                },
            };

            this.wss.send(sendData);
        });

        this.wss.onMessage('moveToPlay', (data) => {
            this.playermanager.sendBeaconFlag = true;
            window.location = `/play/${this.playermanager.roomId}`;
        });

        this.wss.onMessage('entryRoom', (data) => {
            this.startBtn.disabled = true;
            this.startBtn.style.opacity = '0.5';
        });
    }

    sendChatMessage() {
        if (this.chatInput.value == '') return;

        const sendText = this.chatInput.value;
        this.chatInput.value = '';

        const sendData = {
            type: 'sendChat',
            payload: {
                userId: this.playermanager.userId,
                text: sendText,
                roomId: this.playermanager.roomId,
            },
        };
        this.wss.send(sendData);
    }

    changeIsReady(targetId, isReady) {
        const idx = Object.keys(this.playermanager.playerMembers).indexOf(targetId);
        const targetElement = document.getElementById('playerTags').children[idx + 1];
        const temporary = isReady ? 'ready' : 'not-ready';
        targetElement.classList.remove('ready');
        targetElement.classList.remove('not-ready');
        targetElement.classList.add(temporary);

        let readyCnt = 0;
        Array.from(document.getElementById('playerTags').children).forEach((element, index) => {
            if (index > 0) {
                if (element.classList.contains('ready')) readyCnt++;
            }
        });

        console.log(readyCnt);

        if (readyCnt == this.playermanager.getPlayerCount()) {
            this.startBtn.disabled = false;
            this.startBtn.style.opacity = '1';
        } else {
            this.startBtn.disabled = true;
            this.startBtn.style.opacity = '0.5';
        }
    }

    sendReadyMessage(isReady = false) {
        const sendData = {
            type: 'readyMessage',
            payload: { roomId: this.playermanager.roomId, userId: this.playermanager.userId, isReady: isReady },
        };

        this.wss.send(sendData);
    }
}
