let loginFlag = 'login';
const loginHeader = document.getElementsByClassName('login-header')[0];

function changeForm(formName) {
    if (formName == 'login') {
        loginHeader.children[0].firstChild.style.borderBottom = '1px solid white';
        loginHeader.children[1].firstChild.style.borderBottom = '';
        loginFlag = 'login';
    } else {
        loginHeader.children[1].firstChild.style.borderBottom = '1px solid white';
        loginHeader.children[0].firstChild.style.borderBottom = '';
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
