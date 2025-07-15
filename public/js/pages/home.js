import { connectionManager } from '/js/utils/connectionManager.js';
import { functions } from '/js/utils/functions.js';

const mainDiv = document.getElementsByClassName('main-div')[0];
const backgroundDiv = document.getElementById('backgroundDiv');
const createRoomDiv = document.getElementsByClassName('create-room-div')[0];
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const userId = functions.sN(document.getElementById('userID').innerHTML);
let rooms = [];

window.onload = () => {
    const connectionmanager = new connectionManager();
    connectionmanager.connect(`${protocol}://${window.location.host}/home`);

    // サーバーに接続時
    connectionmanager.onOpen(() => {
        console.log('サーバーに接続しました');
    });

    // 部屋のデータを取得
    connectionmanager.onMessage('getRoomData', (data) => {
        if (data.length == 0) return;
        console.log('message : getRoomData');
        console.log(data);
        if (!Array.isArray(data)) {
            rooms.push(data.roomId);
            createNewRoom(data.roomName, data.roomId, data.room_member_counts);
        } else {
            data.forEach((mono) => {
                rooms.push(mono.room_id);
                createNewRoom(mono.room_name, mono.room_id, mono.room_member_counts);
            });
        }
    });

    connectionmanager.onMessage('success', (data) => {
        if (data.type == 'createRoom') {
            //部屋作った人が行くとこ
            window.location.href = `/room/${data.roomId}`;
        }
    });

    // 削除された部屋を非表示
    connectionmanager.onMessage('deleteRoom', (data) => {
        console.log('deleteRoom');
        console.log(rooms);
        const idx = rooms.indexOf(data.roomId);
        if (idx != -1) {
            rooms.splice(idx, 1);
            mainDiv.children[idx].remove();
        }
    });

    // 部屋のデータの変更を取得
    connectionmanager.onMessage('changeRoomData', (data) => {
        updateRoomMemberCounts(data.roomId, parseInt(data.roomMemberCounts));
    });

    document.getElementById('showCreateBtn').addEventListener('click', () => {
        backgroundDiv.style.opacity = '1';
        backgroundDiv.style.pointerEvents = 'all';
        createRoomDiv.style.opacity = '1';
        createRoomDiv.style.pointerEvents = 'all';
    });

    backgroundDiv.addEventListener('click', (e) => {
        backgroundDiv.style.opacity = '0';
        backgroundDiv.style.pointerEvents = 'none';
        createRoomDiv.style.opacity = '0';
        createRoomDiv.style.pointerEvents = 'none';
    });

    document.getElementById('createBtn').addEventListener('click', () => {
        let temporaryList = [];
        Array.from(document.getElementsByClassName('wariai-div')[0].children).forEach((value) => {
            if (Array.from(value.children).length != 2) return;
            const ratio = parseInt(value.children[1].value);
            temporaryList.push(ratio);
        });
        const sendData = {
            type: 'createRoom',
            payload: {
                roomName: document.getElementById('roomName').value,
                ratio: temporaryList,
                userId: userId,
            },
        };
        connectionmanager.send(sendData);
    });
};

function createNewRoom(roomName, roomId, roomMemberCounts = 0) {
    let temporaryDiv = document.createElement('div');
    temporaryDiv.classList.add('room-div');
    let roomNameText = document.createElement('p');
    roomNameText.innerHTML = roomName;
    let temporaryText = document.createElement('p');
    temporaryText.innerHTML = `${roomMemberCounts}/4`;
    mainDiv.appendChild(temporaryDiv);
    temporaryDiv.appendChild(roomNameText);
    temporaryDiv.appendChild(temporaryText);
    if (roomMemberCounts != 4) temporaryDiv.setAttribute('onclick', `window.location.href = '/room/${roomId}';`);
}

function updateRoomMemberCounts(roomId, roomMemberCounts) {
    if (rooms[0] === undefined) window.location = '/home';
    const idx = rooms.indexOf(roomId);
    console.log(mainDiv.children[idx].children);
    mainDiv.children[idx].children[1].innerHTML = `${roomMemberCounts}/4`;

    roomMemberCounts == 4
        ? mainDiv.children[idx].setAttribute('onclick', '')
        : mainDiv.children[idx].setAttribute('onclick', `window.location.href = '/room/${roomId}';`);
}
