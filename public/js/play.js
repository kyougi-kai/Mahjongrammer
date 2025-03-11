let roomSocket;
let parentName;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
window.onload = () => {
    roomSocket = new WebSocket(`${protocol}://${window.location.host}/room`);
    parentName = document.getElementById('parentnameText').textContent;
    if(parentName != document.getElementById('usernameText').textContent){
        roomSocket.onopen = () => {
            roomSocket.send(JSON.stringify({entryRoom:parentName}));
        }
    }
}

window.onbeforeunload = (event) => {
    roomSocket.send(JSON.stringify({outRoom: parentName}));
    event.preventDefault();
    event.returnValue = 'Check';
}