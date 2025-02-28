const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const WebScoket = require('ws');

const app = express();
const wss = new WebScoket.Server({port:8080});

const pool = mysql.createPool({
    user: 'root',
    host: 'localhost',
    database: 'mahjongrammer_db',
    password: 'Kyougikai831',
    connectionLimit:20,
    namedPlaceholders: true
});

app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '../views'));

wss.on('connection', async ws => {
    const data = await getRooms();
    ws.send(JSON.stringify(data));

    ws.on('message', (dt) => {
        console.log(dt);
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
        res.render('pages/room', {rooms: value});
    })
    .catch((err) => {
        console.log("エラーがでたよ : " + err);
    });
});

app.post('/ajax/createRoom', (req,res) => {
    const clientName = req.cookies.name;
    createRoom(clientName);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

function loginCheck(req, res){
    const name = req.cookies.name;
    if(!name){
        res.redirect('/');
    }
}

async function getRooms(){
    const results = await pool.query('select * from room');
    return results[0];
}

async function createRoom(name) {
    await pool.query('insert into room values("' + name + '")');
}
