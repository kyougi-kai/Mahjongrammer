function createRoom(){
    fetch('/ajax/createRoom', {
      method: 'POST'
    })
    .catch(error => {
      console.error('Error:', error);
    });
}