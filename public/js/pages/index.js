let loginFlag = 'login';
const loginHeader = document.getElementsByClassName('login-header')[0];

let startFlag = false;

document.addEventListener('click', () => {
    if (!startFlag) {
        startFlag = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('loginBox').style.display = 'block';
        document.getElementById('loginBox').style.opacity = '1';

        document.getElementById('submitBtn').addEventListener('click', async () => {
            const username = document.getElementById('userName').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`/${loginFlag}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = '/home';
                } else {
                    alert('ログイン失敗: ' + data.error);
                }
            } catch (err) {
                console.log(err);
            }
        });
    }
});

const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const submitBtn = document.getElementById('submitBtn');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    submitBtn.textContent = 'ログイン';
    loginFlag = 'login';
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    submitBtn.textContent = 'サインイン';
    loginFlag = 'signin';
});
