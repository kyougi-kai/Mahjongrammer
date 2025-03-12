let roomSocket;
let playSocket
let parentName;
let username
let parentFlag = true;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
window.onload = () => {
    parentName = document.getElementById('parentnameText').textContent;
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
    });
}

window.onbeforeunload = (event) => {
    if(parentFlag)playSocket.send(JSON.stringify({outRoom: parentName, username:username}));
}