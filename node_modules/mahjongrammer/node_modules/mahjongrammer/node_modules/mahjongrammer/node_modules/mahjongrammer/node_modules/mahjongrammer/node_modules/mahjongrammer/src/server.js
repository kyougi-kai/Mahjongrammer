const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const app = express();

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'Kyougikai831',
    database:'mahjongrammer_db',
    connectionLimit:100,
    namedPlaceholders:true
});

app.use(cookieParser());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, '../views'));

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
    res.render('pages/room');
});

app.post('/ajax/createRoom', (req,res) => {
    console.log('yobareta');
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
