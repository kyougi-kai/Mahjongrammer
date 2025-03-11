const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

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

wss.on('connection', async (ws, req) => {
    const url = req.url;

    switch(url){
        case '/room':
            const data = await pool.query('select username, num_of_childs from users,room where users.user_id = room.parent_id');
            ws.send(JSON.stringify(data[0]));

            ws.on('message', async (dt) => {
                const jdt = JSON.parse(dt);
                const key = Object.keys(jdt)[0];
                try{
                    if(key === 'createRoom'){
                        const userId = await nameToId(jdt.createRoom);
                        const value = await checkValue('room', 'parent_id', userId);
                        if(value == 0){
                            await createRoom(userId, JSON.stringify(jdt.ratio));
                            wss.clients.forEach(client => {
                                client.send(JSON.stringify({newRoom : jdt.createRoom}));
                            });
                        }
                    }
                    else if(key === "deleteRoom"){
                        //消す処理
                        const parentId = await nameToId(jdt.deleteRoom);
                        await deleteRoom(parentId);
                        wss.clients.forEach(client => {
                            client.send(JSON.stringify({deleteRoom : jdt.deleteRoom}));
                        });
                    }
                    else if(key === 'entryRoom'){
                        wss.clients.forEach(async client => {
                            const parentId = await nameToId(jdt.entryRoom);
                            await pool.query('update room set num_of_childs = num_of_childs + 1 where parent_id = ?', [parentId]);
                            const numOfChilds = await getRow('room', 'num_of_childs', 'parent_id', parentId);
                            client.send(JSON.stringify({entryRoomName:jdt.entryRoom, numOfChilds: numOfChilds}));
                        });
                    }
                }
                catch(err){
                    console.log('Error :' + err);
                }
            });
        break;
    }
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

app.get('/play/:parentName', async (req, res) => {
    try{
        const parentId = await nameToId(req.params.parentName);
        const username = await idToName(req.cookies.userId);
        res.render('pages/play', {parentName:req.params.parentName, username:username});
    }
    catch(err){
        console.log(`Error :${err}`);
        res.redirect('/room');
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
        console.log(`Error :${err}`);
    }
});

app.get('/logout', async (req, res) => {
    loginCheck(req, res);

    try{
        res.clearCookie('userId', {path:'/'});
        res.redirect('/');
    }
    catch(err){
        console.log(`Error :${err}`);
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
        console.log(`Error :${err}`);
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
        console.log(`Error :${err}`);
        res.json({success: false, error:err});
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

async function savelogin(res, username){
    const userId = await nameToId(username);
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

async function createRoom(parentId, ratio) {
    await pool.query('insert into room (parent_id, ratio) values(?, ?)', [parentId, ratio]);
}

async function deleteRoom(parentId) {
    await pool.query(`delete from room where parent_id = ?`, [parentId]);
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

async function getRows(tableName, filterName, value) {
    const result = await pool.query(`select * from ${tableName} where ${filterName} = ?`, [value]);
    return result[0];
}

async function deleteUser(userId) {
    await pool.query('delete from users where user_id = ?', [userId]);
}

async function nameToId(username) {
    const result = await pool.query('select user_id from users where username = ?', [username]);
    return result[0][0]['user_id'];
}

async function idToName(userId) {
    const result = await pool.query('select username from users where user_id = ?', [userId]);
    return result[0][0]['username'];
}
