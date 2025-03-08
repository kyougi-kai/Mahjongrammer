let loginFlag = true;
const loginHeader = document.getElementsByClassName('login-header')[0];

function changeForm(formName){
    if(formName == 'login'){
        loginHeader.children[0].firstChild.style.borderBottom='1px solid white';
        loginHeader.children[1].firstChild.style.borderBottom='';
        loginFlag = true;
    }
    else{
        loginHeader.children[1].firstChild.style.borderBottom='1px solid white';
        loginHeader.children[0].firstChild.style.borderBottom='';
        loginFlag = false;
    }
}

function decide(){
    
}