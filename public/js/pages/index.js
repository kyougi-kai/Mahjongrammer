let loginFlag = 'login';
const loginHeader = document.getElementsByClassName('login-header')[0];

function changeForm(formName) {
    if (formName == 'login') {
        loginHeader.children[0].children[0].style.borderBottom = '1px solid white';
        loginHeader.children[1].children[0].style.borderBottom = '';
        loginFlag = 'login';
    } else {
        console.log(loginHeader.children[1]);
        loginHeader.children[1].children[0].style.borderBottom = '1px solid white';
        loginHeader.children[0].children[0].style.borderBottom = '';
        loginFlag = 'signin';
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        const response = await fetch(`/${loginFlag}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/room';
        } else {
            alert('ログイン失敗: ' + data.error);
        }
    } catch (err) {
        console.log(err);
    }
});

const hyoujis = document.getElementById('hyouji');
const hyoujis2 =document.getElementById('hyoujis');

hyoujis.addEventListener('click', () => {
     hyoujis.style.display = 'none';
     hyoujis2.style.display = 'inline';
});