const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const pool = mysql.createPool({
    host: 'trolley.proxy.rlwy.net',
    user: 'root',
    password: 'yqHSkiatKYxPmlMdQJjdArjmYmdiWhDB',
    database: 'railway',
    port: '59200',
    connectionLimit:20,
    namedPlaceholders: true,
    charset: 'utf8mb4'
});

app.use(cookieParser());
app.use(express.static('public'));

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
                const value = await checkValue('Room', 'parent_name', jdt.createRoom)
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
    const name = req.cookies.name;
    const inputName = req.query.name;
    if(inputName){
        res.cookie('name', inputName, {
            maxAge: 259200000,
            httpOnly: true,
            path: '/'
        });
        res.redirect('/room');
    }

    if(name){
        res.redirect('/room');
    }
    else{
        res.render('pages/index');
    }
});

app.get('/room', (req, res) => {
    loginCheck(req, res);

    getRooms()
    .then((value) => {
        console.log(value);
        res.render('pages/room', {name:req.cookies.name});
    })
    .catch((err) => {
        console.log("エラーがでたよ : " + err);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function loginCheck(req, res){
    const name = req.cookies.name;
    if(!name){
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
