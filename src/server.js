const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const http = require('http')

const server = http.createServer((req, res) => {
    if(req.url === "/"){
        returnFile('./public/html/test-0.1.html')
    }
    console.log(req.url);
    fs.readFile('./public/html/test-0.1.html', 'utf-8', (error, data) => {
        if(error){
            console.error(error);
            return;
        }
        
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write(data);
        res.end();
    })
});

function returnFile(path){

}

server.listen(8080, ()=>{
    console.log("うごいてるよ！");  
});
