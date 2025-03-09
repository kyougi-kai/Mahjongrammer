const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { error, table } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.dbport,
    connectionLimit:20,
    namedPlaceholders: true,
    charset: 'utf8mb4'
});

app.use(cookieParser());
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));

wss.on('connection', async ws => {
    const data = await getRooms();
    ws.send(JSON.stringify(data));

    ws.on('message', async (dt) => {
        try{
            const jdt = JSON.parse(dt);
            const key = Object.keys(jdt)[0];
            if(key == 'createRoom'){
                const value = await checkValue('Room', 'parent_name', jdt.createRoom);
                if(value == 0){
                    createRoom(jdt.createRoom);
                    wss.clients.forEach(client => {
                        client.send(JSON.stringify({newRoom : jdt.createRoom}));
                    });
                }
            }
            else if(key == "deleteRoom"){
                //消す処理
                await deleteRoom(jdt.deleteRoom);
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({deleteRoom : jdt.deleteRoom}));
                });
            }
        }
        catch(err){
            console.log(err);
        }
    })
});

app.get('/', (req,res) => {
    const loginId = req.cookies.loginId;
    if(loginId){
        res.redirect('/room');
    }
    else{
        res.render('pages/index');
    }
});

app.get('/room', async (req, res) => {
    loginCheck(req, res);

    try{
        res.render('pages/room', {name:await getRow('users', 'username', 'user_id', req.cookies.userId)});
    }
    catch(err){
        console.log('Error :' + err);
    }
});

app.get('/deleteUser', async (req, res) => {
    loginCheck(req, res);

    try{
        await deleteUser(req.cookies.userId);
        res.clearCookie('userId', {path:'/'});
        res.redirect('/');
    }
    catch(err){
        console.log(err);
    }
});

app.get('/logout', async (req, res) => {
    loginCheck(req, res);

    try{
        res.clearCookie('userId', {path:'/'});
        res.redirect('/');
    }
    catch(err){
        console.log(err);
    }
})

app.post('/login', async(req, res) => {
    const {username, password} = req.body;
    try{
        if(await checkValue('users', 'username', username) == 1 && await checkValue('users', 'password', password) == 1){
            await savelogin(res, username);
            res.json({success: true});
        }
        else{
            res.json({success:false, error:'ユーザー名またはパスワードが間違っています'});
        }
    }
    catch(err){
        console.log(err);
        res.json({success: false, error:err});
    }
});

app.post('/signin', async (req, res) => {
    const {username, password} = req.body;
    try{
        if(await checkValue('users', 'username', username) == 1){
            res.json({success: false, error:'ユーザー名が既に使われています'});
        }
        else{
            await addUser(username, password);
            await savelogin(res, username);
            res.json({success: true});
        }
    }
    catch(err){
        console.log(err);
        res.json({success: false, error:err});
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

async function savelogin(res, username){
    const userId = await getRow('users', 'user_id', 'username', username);
    res.cookie('userId', userId, {
        maxAge: 259200000,
        httpOnly: true,
        path: '/'
    });
}

function loginCheck(req, res){
    const userId = req.cookies.userId;
    if(!userId){
        res.redirect('/');
    }
}

async function getRooms(){
    const results = await pool.query('select * from Room');
    return results[0];
}

async function createRoom(name) {
    await pool.query(`insert into Room values(?)`, [name]);
}

async function deleteRoom(name) {
    await pool.query(`delete from Room where parent_name = ?`, [name]);
}

async function checkValue(tableName, fieldName, value){
    const result = await pool.query(`select count(*) from ${tableName} where ${fieldName} = '${value}'`);
    return result[0][0]['count(*)'];
}

async function addUser(username, password) {
    await pool.query('insert into users (username, password) values(?,?);', [username, password]);
}

async function getRow(tableName, fieldName, filterName, value) {
    const result = await pool.query(`select ${fieldName} from ${tableName} where ${filterName} = ?`, [value]);
    return result[0][0][fieldName];
}

async function deleteUser(userId) {
    await pool.query('delete from users where user_id = ?', [userId]);
}
