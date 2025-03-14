let roomSocket;
let playSocket
let parentName;
let username
let parentFlag = true;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
window.onload = () => {
    const nameDivs = document.getElementsByClassName('name');
    parentName = (window.location.pathname).split('/')[2];
    username = document.getElementById('usernameText').textContent;
    playSocket = new WebSocket(`${protocol}://${window.location.host}/play/${parentName}`);

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

            Array.from(nameDivs).forEach((value) => {
                value.children[0].innerHTML = '';
            });
            
            roomMembers.forEach((member, index) => {
                const target = nameDivs[(2 - ownNumber + index) % 4].children[0];
                index == 0 ? target.style.color = 'red' : target.style.color = 'black';
                target.innerHTML = member.username;
            });
        }
    });
}

window.onbeforeunload = (event) => {
    if(parentFlag)playSocket.send(JSON.stringify({outRoom: parentName, username:username}));
}