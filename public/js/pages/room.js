import { connectionManager } from '/js/utils/connectionManager.js';

const mainDiv = document.getElementsByClassName('main-div')[0];
const userNameText = document.getElementById('userName');
const backgroundDiv = document.getElementById('backgroundDiv');
const createRoomDiv = document.getElementsByClassName('create-room-div')[0];
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
let startFlg = false;
let rooms = [];

window.onload = () => {
    const connectionmanager = new connectionManager();
    connectionmanager.connect(`${protocol}://${window.location.host}/room`);

    // サーバーに接続時
    connectionmanager.onOpen(() => {
        console.log('サーバーに接続しました');
    });

    // 部屋のデータを取得
    connectionmanager.onMessage('getRoomData', (data) => {
        data.forEach((mono) => {
            rooms.push(mono.username);
            createNewRoom(mono.username, mono.room_member_counts);
        });
    });

    // 削除された部屋を非表示
    connectionmanager.onMessage('deleteRoom', (data) => {
        const idx = rooms.indexOf(data.roomName);
        if (idx != -1) {
            rooms.splice(idx, 1);
            mainDiv.children[idx].remove();
        }
    });

    // 部屋のデータの変更を取得
    connectionmanager.onMessage('changeRoomData', (data) => {
        updateRoomMemberCounts(data.roomName, parseInt(data.roomMemberCounts));
    });

    document.getElementById('showCreateBtn').addEventListener('click', () => {
        backgroundDiv.style.opacity = '1';
        createRoomDiv.style.opacity = '1';
        backgroundDiv.style.pointerEvents = 'all';
        createRoomDiv.style.pointerEvents = 'all';
    });

    backgroundDiv.addEventListener('click', () => {
        backgroundDiv.style.opacity = '0';
        createRoomDiv.style.opacity = '0';
        backgroundDiv.style.pointerEvents = 'none';
        createRoomDiv.style.pointerEvents = 'none';
    });

    document.getElementById('createBtn').addEventListener('click', () => {
        let temporaryList = [];
        Array.from(createRoomDiv.children).forEach((value) => {
            if (Array.from(value.children).length != 2) return;
            const ratio = parseInt(value.children[1].value);
            temporaryList.push(ratio);
        });
        const sendData = JSON.stringify({
            type: 'createRoom',
            payload: {
                roomName: userNameText.textContent.replace(/\s+/g, ''),
                ratio: temporaryList,
            },
        });
        connectionmanager.send(sendData);
        // window.location.href = `/play/${userNameText.textContent.replace(/\s+/g, '')}`;
    });
};

function createNewRoom(roomName, roomMemberCounts = 0) {
    let temporaryDiv = document.createElement('div');
    temporaryDiv.classList.add('room-div');
    let roomNameText = document.createElement('p');
    roomNameText.innerHTML = roomName;
    let temporaryText = document.createElement('p');
    temporaryText.innerHTML = `${roomMemberCounts}/4`;
    mainDiv.appendChild(temporaryDiv);
    temporaryDiv.appendChild(roomNameText);
    temporaryDiv.appendChild(temporaryText);
    if (roomMemberCounts != 4) temporaryDiv.setAttribute('onclick', `entryRoom('${roomName}');`);
}

function updateRoomMemberCounts(roomName, roomMemberCounts) {
    const idx = rooms.indexOf(roomName);
    console.log(mainDiv.children[idx].children);
    mainDiv.children[idx].children[1].innerHTML = `${roomMemberCounts}/4`;

    roomMemberCounts == 4
        ? mainDiv.children[idx].setAttribute('onclick', '')
        : mainDiv.children[idx].setAttribute('onclick', `window.location.href = '/play/${roomName}';`);
}
