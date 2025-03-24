import gameManager from '/js/play/HaiManager.js';

let playSocket
let parentName;
let username
let parentFlag = true;
let isParent = false;
let players = [];
let myTurn = false;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const scoreBord = document.getElementById('scoreBord');
const _gameManager = new gameManager();

window.onload = () => {
    const nameDivs = document.getElementsByClassName('name');
    parentName = decodeURIComponent(window.location.pathname).split('/')[2];
    username = document.getElementById('usernameText').textContent;
    playSocket = new WebSocket(`${protocol}://${window.location.host}/play/${parentName}`);

    isParent = username == parentName ? true : false;
    _gameManager.isParent = isParent;
    !isParent ? document.getElementById('closeBtn').remove() : document.getElementById('closeBtn').style.display = 'block';

    playSocket.addEventListener('open', () => {
        console.log("サーバーに接続しました");
        playSocket.send(JSON.stringify({entryRoom: parentName, username:username}));
    });

    playSocket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if(message.hasOwnProperty('forcedFinish')){
            parentFlag = false;
            alert('親が退出しました');
            window.location.href = '/room';
        }
        else if(message.hasOwnProperty('roomMembers')){
            console.log('ネームタグの入れ替えをします');
            const roomMembers = message.roomMembers;
            let ownNumber;
            roomMembers.forEach((member, index) => {
                if(member.username == username){
                    ownNumber = index;
                    return;
                }
            });
            console.log(ownNumber);
            _gameManager.ownNumber = ownNumber;
            _gameManager.roomMemberCounts = roomMembers.length;

            Array.from(nameDivs).forEach((value) => {
                value.children[0].innerHTML = '';
            });
            
            roomMembers.forEach((member, index) => {
                const target = nameDivs[(2 - ownNumber + index) % 4].children[0];
                index == 0 ? target.style.color = 'red' : target.style.color = 'black';
                target.innerHTML = member.username;
            });
            players = roomMembers.concat();
        }
        else if(message.hasOwnProperty('start')){
            _gameManager.gameStart();
        }
    });
}

document.getElementById('closeBtn').addEventListener("click", async (event) => {
    if(players.length == (1, 0))return;

    try{
        document.getElementById('closeBtn').style.display = 'none';
        const response = await fetch(`/play/${parentName}`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({roomClose:true})
        });
    }
    catch(err){
        console.error(err);
    }
});

window.onbeforeunload = (event) => {
    if(parentFlag)playSocket.send(JSON.stringify({outRoom: parentName, username:username}));
}
