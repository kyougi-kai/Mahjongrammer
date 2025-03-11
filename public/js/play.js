let socket;
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
window.onload = () => {
    const parentName = document.getElementById('parentnameText').textContent;
    if(parentName != document.getElementById('usernameText').textContent){
        socket = new WebSocket(`${protocol}://${window.location.host}/room`);

        socket.onopen = () => {
            socket.send(JSON.stringify({entryRoom:parentName}));
        }
    }
}
