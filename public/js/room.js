const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('message', (event) => {
  console.log(event);
});

function createRoom(){
    fetch('/ajax/createRoom', {
      method: 'POST'
    })
    .catch(error => {
      console.error('Error:', error);
    });
}