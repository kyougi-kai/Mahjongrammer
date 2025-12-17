import { connectionManager } from '/js/utils/connectionManager.js';
import { functions } from '/js/utils/functions.js';
import { AM } from '/js/utils/audioManager.js';

// ===== DOMキャッシュ =====
const dom = {
    background: document.getElementById('backgroundDiv'),
    accountSetting: document.getElementById('accountSetting'),
    createRoom: document.getElementById('createRoomDiv'),
    createRoomName: document.getElementById('CreatSet'),
    roomList: document.getElementById('roomList'),
    nowColor: document.getElementById('nowColor'),
    colorChange: document.getElementById('settingdiv'),
    matchmakingContainer: document.querySelector('.matchmaking-container'),
};

const btns = {
    matchBtn: document.getElementById('matchBtn'),
};

// ===== 変数 =====
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const userId = functions.sN(document.getElementById('userID').innerHTML);
const rooms = new Map(); // roomId → {div, count}
let active = false; // マッチメイキングの状態

// ==========================
// 初期化
// ==========================
window.onload = init;

function init() {
    const ws = new connectionManager();
    ws.connect(`${protocol}://${window.location.host}/home`);

    ws.onOpen(() => onWSConnected(ws));
    handleWSMessage(ws);

    bindUIEvents(ws);
    adjustButtonPositions();
    window.addEventListener('resize', adjustButtonPositions);
    AM.lobbybgmStart();
}

// ==========================
// WebSocket Event Handlers
// ==========================
function onWSConnected(ws) {
    console.log('サーバーに接続しました');

    // 部屋情報取得
    setTimeout(() => {
        ws.send({ type: 'requestRoomData', payload: {} });

        ws.send({
            type: 'entryHome',
            payload: { userId },
        });
    }, 500);
}

function handleWSMessage(ws) {
    ws.onMessage('setColor', (data) => {
        updateColor(data.color);
    });

    ws.onMessage('getRoomData', (data) => {
        renderInitialRooms(data);
    });

    ws.onMessage('success', (data) => {
        if (data.type === 'createRoom') {
            window.location.href = `/room/${data.roomId}`;
        }
    });
    ws.onMessage('deleteRoom', (data) => {
        removeRoom(data.roomId);
    });

    ws.onMessage('changeRoomData', (data) => {
        updateRoomCount(data.roomId, parseInt(data.roomMemberCounts));
    });
}

// ==========================
// UI Updating Functions
// ==========================
function renderInitialRooms(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) return;

    (Array.isArray(data) ? data : [data]).forEach((room) => {
        createRoomItem(room.room_name, room.room_id, room.room_member_counts);
    });
}

function createRoomItem(name, roomId, count = 0) {
    const div = document.createElement('div');
    div.className = 'room-item';
    div.innerHTML = `
        <div class="room-info">
            <div class="room-name">${name}</div>
            <div class="room-count">${count} / 4人</div>
        </div>
    `;

    const btn = document.createElement('button');
    btn.className = 'join-btn';
    btn.textContent = '参加';
    btn.onclick = AM.bgmStop();
    btn.onclick = () => (window.location.href = `/room/${roomId}`);
    div.appendChild(btn);

    rooms.set(roomId, { div, count });
    dom.roomList.children[1].appendChild(div);
}

function removeRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.div.remove();
    rooms.delete(roomId);
}

function updateRoomCount(roomId, count) {
    const room = rooms.get(roomId);
    if (!room) {
        window.location = '/home';
        return;
    }

    room.count = count;
    room.div.querySelector('.room-count').textContent = `${count} / 4人`;

    const btn = room.div.querySelector('.join-btn');
    btn.disabled = count >= 4;
}

function updateColor(color) {
    if (!color) return;
    dom.nowColor.style.backgroundColor = color;
    dom.nowColor.style.color = '#fff';
    dom.nowColor.textContent = 'now color ';
    const colors = [
        'rgba(255,255,255,0.8)',
        'rgba(0,255,0,0.8)',
        'rgba(255,255,0,0.8)',
        'rgba(255,165,0,0.8)',
        'rgba(0,255,255,0.8)',
        'rgba(191,255,0,0.8)',
    ];
    const normalizedColor = color.replace(/\s+/g, '').toLowerCase();
    if (colors.includes(normalizedColor)) {
        dom.nowColor.style.color = '#000';
    }
}

function toggleMatchUi() {
    active = !active;
    if (active) {
        btns.matchBtn.textContent = 'キャンセル';
        dom.matchmakingContainer.classList.add('active');
    } else {
        btns.matchBtn.textContent = 'マッチメイキング';
        dom.matchmakingContainer.classList.remove('active');
    }
}

const turnCount = document.getElementById('turnCount');
const turnValue = document.getElementById('turnValue');
turnCount.textContent = turnCount.value;
turnCount.parentNode.appendChild(turnValue);

turnCount.addEventListener('input', (e) => {
    turnValue.innerHTML = `${turnCount.value}ターン`;
});

// ==========================
// Event Bindings
// ==========================
function bindUIEvents(ws) {
    document.getElementById('showCreateBtn').onclick = () => {
        show(dom.background);
        dom.createRoom.classList.add('show');
    };

    dom.background.onclick = hideAllPopups;

    document.getElementById('createBtn').onclick = () => {
        ws.send({
            type: 'createRoom',
            payload: {
                roomName: document.getElementById('roomName').value,
                ratio: [5, 4, 2, 0, 2, 1, 0, 0, 2, 2],
                userId,
                turn: document.getElementById('turnCount').value,
            },
        });
        AM.soundEffects('acreateroom');
        AM.bgmStop();
    };

    document.getElementById('galaxyBtn').onclick = () => {
        show(dom.background);
        show(dom.roomList);
    };

    document.getElementById('wa').onclick = () => {
        show(dom.background);
        show(dom.colorChange);
    };

    document.getElementById('closeRoomList').onclick = hideAllPopups;
    document.getElementById('closeCreateRoom').onclick = hideAllPopups;

    document.getElementById('profile').onclick = () => {
        show(dom.accountSetting);
        show(dom.background);
    };

    setupColorPicker(ws);

    // マッチメイキングボタン

    // btns.matchBtn.onclick = () => {
    //     toggleMatchUi();
    // };
}

function setupColorPicker(ws) {
    Array.from(document.getElementsByClassName('colorbox')).forEach((box) => {
        box.onclick = () => {
            ws.send({
                type: 'changeColor',
                payload: { userId, color: box.style.backgroundColor },
            });

            hideAllPopups();
            dom.nowColor.style.backgroundColor = box.style.backgroundColor;
            dom.nowColor.style.color = box.style.color;
            dom.nowColor.textContent = `now your color is ${box.textContent}`;
        };
    });
}

// ==========================
// Utility
// ==========================
function show(el) {
    el.style.opacity = 1;
    el.style.pointerEvents = 'all';
}
function hide(el) {
    el.style.opacity = 0;
    el.style.pointerEvents = 'none';
}

function hideAllPopups() {
    hide(dom.background);
    hide(dom.colorChange);
    hide(dom.roomList);
    hide(dom.accountSetting);
    dom.createRoom.classList.remove('show');
}

function adjustButtonPositions() {
    const bg = document.getElementById('backgroundImage');
    const imgHeight = parseInt(bg.offsetHeight);

    document.getElementById('showCreateBtn').style.bottom = Math.floor(imgHeight * 0.17) + 'px';

    document.getElementById('profile').style.top = Math.floor(imgHeight * 0.07) + 'px';
}

// ===========================
// WebSocket Send Messages
// ==========================

// マッチメイキングの開始/停止メッセージを送信 次かく
