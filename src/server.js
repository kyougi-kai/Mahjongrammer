const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.static('public'));

app.use(express.json());

app.post('/saveFile', (req, res) => {
    const { text } = req.body;
    fs.writeFile("./public/data.txt", text, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.send("ファイルが保存されました");
    });
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
