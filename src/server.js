const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
app.engine('ejs', ejs.renderFile);
const template = fs.readFileSync('./public/html/test-0.1.ejs', 'utf8');

app.get('/', (req, res) => {
    ejs.render(template, {
        title:"EJS Sample Code",
        content: "This is EJS Sample..."
    }, (err, html) => {
        if(err){
            res.status(500).send("エラー");
        }
        else {
            res.send(html);
        }
    });
});

app.listen(8081, ()=>{
    console.log("Server is running on http://localhost:8081");
});
