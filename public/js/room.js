const mainDiv = document.getElementsByClassName('main-div')[0];
const userNameText = document.getElementById('userName');
const backgroundDiv = document.getElementsByClassName('background-div')[0];
const createRoomDiv = document.getElementsByClassName('create-room-div')[0];
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
let socket;
let startFlg = false;
let rooms = [];

window.onload = () => {
  socket = new WebSocket(`${protocol}://${window.location.host}`);

  socket.addEventListener('open', (event) => {
    console.log("サーバーに接続しました");
  });

  socket.addEventListener('message', (event) => {
    let message = JSON.parse(event.data);
    if(startFlg){
      const key = Object.keys(message)[0];
      if(key == 'newRoom'){
        rooms.push(message[key]);
        createNewRoom(message[key]);
      }
      else if(key == 'deleteRoom'){
        const idx = rooms.indexOf(message[key]);
        rooms.splice(idx, 1);
        mainDiv.children[idx].remove();
      }
    }
    else{
      startFlg = true;
      message.forEach((value) => {
        rooms.push(value.parent_name);
        createNewRoom(value.parent_name);
      });
    }
  });

  console.log(document.cookie);
}

function showCreateRoom(){
  backgroundDiv.style.opacity = '1';
  createRoomDiv.style.opacity = '1';
  createRoomDiv.style.pointerEvents = 'all';
}

function createNewRoom(roomName){
  let temporaryDiv = document.createElement('div');
  temporaryDiv.classList.add('room-div');
  temporaryDiv.innerHTML = roomName;
  mainDiv.appendChild(temporaryDiv);
}

function createRoom(){
  const sendData = JSON.stringify({createRoom : userNameText.textContent});
  socket.send(sendData);
}

function deleteRoom(){
  const idx = rooms.indexOf(userNameText.textContent);
  if(idx != -1){
    const sendData = JSON.stringify({deleteRoom: userNameText.textContent});
    socket.send(sendData);
  }
}
