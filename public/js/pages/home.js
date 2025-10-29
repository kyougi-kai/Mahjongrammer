import { connectionManager } from '/js/utils/connectionManager.js';
import { functions } from '/js/utils/functions.js';
import { AM } from '/js/utils/audioManager.js';

const backgroundDiv = document.getElementById('backgroundDiv');
const backgroundDivName = document.getElementById('backgroundDivName');
const createRoomDiv = document.getElementById('createRoomDiv');
const createRoomName = document.getElementById('CreatSet');
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const userId = functions.sN(document.getElementById('userID').innerHTML);
const roomList = document.getElementById('roomList');
const mainDiv = roomList.children[1];
const colorChange = document.getElementById('settingdiv');
const nowColor = document.getElementById('nowColor');
let rooms = [];

window.onload = () => {
    const connectionmanager = new connectionManager();
    connectionmanager.connect(`${protocol}://${window.location.host}/home`);

    // サーバーに接続時
    connectionmanager.onOpen(() => {
        console.log('サーバーに接続しました');
        setTimeout(() => {
            const sendData = {
                type: 'requestRoomData',
                payload: {},
            };
            connectionmanager.send(sendData);
            // サーバーにエントリーして現在の色を取得
            const entryData = {
                type: 'entryHome',
                payload: { userId: userId },
            };
            connectionmanager.send(entryData);
        }, 1000);
    });

    // サーバーから色を受け取って #nowColor を更新
    connectionmanager.onMessage('setColor', (data) => {
        console.log(`now color${data.color}`);
        if (!data || !data.color) return;
        nowColor.style.backgroundColor = data.color;
        nowColor.style.color = '#ffffff';
        if (data.color === 'rgba(255, 255, 255,0.8)'|| data.color === 'rgba(255, 255, 255,0.8)') {
        }
        nowColor.innerHTML = `now your color is`;
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
        colorChange.style.opacity = '0';
        colorChange.style.pointerEvents = 'none';
    });

    document.getElementById('wa').addEventListener('click', () => {
        colorChange.style.opacity = '1';
        colorChange.style.pointerEvents = 'all';
        createRoomDiv.style.opacity = '0';
        createRoomDiv.style.pointerEvents = 'none';
        backgroundDiv.style.opacity = '1';
        backgroundDiv.style.pointerEvents = 'all';
    });

    document.getElementById('createBtn').addEventListener('click', () => {
        const sendData = {
            type: 'createRoom',
            payload: {
                roomName: document.getElementById('roomName').value,
                ratio: [5, 4, 2, 0, 2, 1, 0, 0, 2, 2],
                userId: userId,
            },
        };
        connectionmanager.send(sendData);
        
        //効果音
        AM.soundEffects(acreateroom);
    });

    // ボタンの位置
    document.getElementById('showCreateBtn').style.bottom =
        Math.floor(parseInt(document.getElementById('backgroundImage').offsetHeight) * 0.17) +
        (parseInt(window.innerHeight) - parseInt(document.getElementById('backgroundImage').offsetHeight)) / 2 +
        'px';

    document.getElementById('profile').style.top =
        Math.floor(parseInt(document.getElementById('backgroundImage').offsetHeight) * 0.07) +
        (parseInt(window.innerHeight) - parseInt(document.getElementById('backgroundImage').offsetHeight)) / 2 +
        'px';

    for (let i = 0; i < 14; i++) {
        document.getElementsByClassName('colorbox')[i].addEventListener('click', () => {
            const color = document.getElementsByClassName('colorbox')[i].style.backgroundColor;
            const textColor = document.getElementsByClassName('colorbox')[i].style.color;
            const text = document.getElementsByClassName('colorbox')[i].innerHTML;
            let sendData = {
                type: 'changeColor',
                payload: {
                    userId: userId,
                    color: color,
                },
            };
            connectionmanager.send(sendData);
            backgroundDiv.style.opacity = '0';
            backgroundDiv.style.pointerEvents = 'none';
            createRoomDiv.style.opacity = '0';
            createRoomDiv.style.pointerEvents = 'none';
            colorChange.style.opacity = '0';
            colorChange.style.pointerEvents = 'none';
            nowColor.style.backgroundColor = color;
            nowColor.style.color = textColor;
            nowColor.innerHTML = `now your color is ${text}`;
        });
    }
};

window.addEventListener('resize', () => {
    document.getElementById('showCreateBtn').style.bottom =
        Math.floor(parseInt(document.getElementById('backgroundImage').offsetHeight) * 0.17) +
        (parseInt(window.innerHeight) - parseInt(document.getElementById('backgroundImage').offsetHeight)) / 2 +
        'px';

    document.getElementById('profile').style.top =
        Math.floor(parseInt(document.getElementById('backgroundImage').offsetHeight) * 0.07) +
        (parseInt(window.innerHeight) - parseInt(document.getElementById('backgroundImage').offsetHeight)) / 2 +
        'px';
});

function createNewRoom(roomName, roomId, roomMemberCounts = 0) {
    let temporaryDiv = document.createElement('div');
    temporaryDiv.classList.add('room-item');
    temporaryDiv.innerHTML = `<div class='room-info'><div class='room-name'>${roomName}</div><div class='room-count'>${roomMemberCounts} / 4人</div></div>`;
    let temporaryBtn = document.createElement('button');
    temporaryBtn.classList.add('join-btn');
    temporaryBtn.innerHTML = '参加';
    temporaryBtn.setAttribute('onclick', `window.location.href = '/room/${roomId}';`);
    temporaryDiv.appendChild(temporaryBtn);
    roomList.children[1].appendChild(temporaryDiv);
}

function updateRoomMemberCounts(roomId, roomMemberCounts) {
    if (rooms[0] === undefined) window.location = '/home';
    const idx = rooms.indexOf(roomId);
    console.log(mainDiv);
    console.log(mainDiv.children[idx]);
    console.log(mainDiv.children[idx].children[0]);
    mainDiv.children[idx].children[0].children[1].innerHTML = `${roomMemberCounts} / 4人`;
    roomMemberCounts == 4
        ? mainDiv.children[idx].children[0].children[1].setAttribute('onclick', '')
        : mainDiv.children[idx].children[0].children[1].setAttribute('onclick', `window.location.href = '/room/${roomId}';`);
}

document.getElementById('setname').addEventListener('click', () => {
    backgroundDivName.style.opacity = '1';
    backgroundDivName.style.pointerEvents = 'all';
    createRoomName.style.opacity = '1';
    createRoomName.style.pointerEvents = 'all';
});
backgroundDivName.addEventListener('click', (e) => {
    backgroundDivName.style.opacity = '0';
    backgroundDivName.style.pointerEvents = 'none';
    createRoomName.style.opacity = '0';
    createRoomName.style.pointerEvents = 'none';
});

document.getElementById('galaxyBtn').addEventListener('click', () => {
    if (roomList.style.opacity == '0') {
        roomList.style.opacity = '1';
        roomList.style.pointerEvents = 'all';
    }
});

document.getElementById('closeRoomList').addEventListener('click', () => {
    roomList.style.opacity = '0';
    roomList.style.pointerEvents = 'none';
});

document.getElementById('closeCreateRoom').addEventListener('click', () => {
    createRoomDiv.style.opacity = '0';
    createRoomDiv.style.pointerEvents = 'none';
    backgroundDiv.style.opacity = '0';
    backgroundDiv.style.pointerEvents = 'none';
});
