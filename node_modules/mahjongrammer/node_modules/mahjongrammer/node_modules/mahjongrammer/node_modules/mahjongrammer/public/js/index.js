const inputName = document.getElementById('inputName');

function decideName(){
    if(inputName.value != ""){
        window.location.href = "/?name=" + inputName.value;
    }
}