const mainDiv = document.getElementsByClassName('main-div')[0];
const userNameText = document.getElementById('userName');
const backgroundDiv = document.getElementsByClassName('background-div')[0];
const createRoomDiv = document.getElementsByClassName('create-room-div')[0];
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
let socket;
let startFlg = false;
let rooms = [];

window.onload = () => {
    socket = new WebSocket(`${protocol}://${window.location.host}/room`);

    socket.addEventListener('open', (event) => {
        console.log('サーバーに接続しました');
    });

    socket.addEventListener('message', (event) => {
        let message = JSON.parse(event.data);
        if (startFlg) {
            const key = Object.keys(message)[0];
            if (key === 'newRoom') {
                rooms.push(message[key]);
                createNewRoom(message[key]);
            } else if (key === 'deleteRoom') {
                const idx = rooms.indexOf(message[key]);
                if (idx != -1) {
                    rooms.splice(idx, 1);
                    mainDiv.children[idx].remove();
                }
            } else if (key === 'entryRoom') {
                updateRoomMemberCounts(message.entryRoom, parseInt(message.roomMemberCounts));
            } else if (key === 'outRoom') {
                updateRoomMemberCounts(message.outRoom, parseInt(message.roomMemberCounts));
            }
        } else {
            startFlg = true;
            message.forEach((value) => {
                rooms.push(value.username);
                createNewRoom(value.username, parseInt(value.room_member_counts));
            });
        }
    });

    console.log(document.cookie);
};

function showCreateRoom() {
    backgroundDiv.style.opacity = '1';
    createRoomDiv.style.opacity = '1';
    backgroundDiv.style.pointerEvents = 'all';
    createRoomDiv.style.pointerEvents = 'all';
}

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

function entryRoom(roomName) {
    window.location.href = `/play/${roomName}`;
}

function updateRoomMemberCounts(roomName, roomMemberCounts) {
    const idx = rooms.indexOf(roomName);
    console.log(mainDiv.children[idx].children);
    mainDiv.children[idx].children[1].innerHTML = `${roomMemberCounts}/4`;

    roomMemberCounts == 4
        ? mainDiv.children[idx].setAttribute('onclick', '')
        : mainDiv.children[idx].setAttribute('onclick', `entryRoom('${roomName}');`);
}

function createRoom() {
    let temporaryList = [];
    Array.from(createRoomDiv.children).forEach((value) => {
        if (Array.from(value.children).length != 2) return;
        const ratio = parseInt(value.children[1].value);
        temporaryList.push(ratio);
    });
    const sendData = JSON.stringify({
        createRoom: userNameText.textContent.replace(/\s+/g, ''),
        ratio: temporaryList,
    });
    socket.send(sendData);
    window.location.href = `/play/${userNameText.textContent.replace(/\s+/g, '')}`;
}

function closeDiv() {
    backgroundDiv.style.opacity = '0';
    createRoomDiv.style.opacity = '0';
    backgroundDiv.style.pointerEvents = 'none';
    createRoomDiv.style.pointerEvents = 'none';
}
