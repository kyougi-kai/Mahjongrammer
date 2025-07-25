const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.dbport,
    connectionLimit: 20,
    namedPlaceholders: true,
    charset: 'utf8mb4',
});

pool.query('delete from rooms');

app.use(cookieParser());
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const roomClients = new Map();
const playClients = {};
const playDatas = {};

wss.on('connection', async (ws, req) => {
    const url = req.url;

    if (url === '/room') {
        const uuid = uuidv4();
        roomClients.set(uuid, ws);
        console.log(`roomClients : ${roomClients.size}`);

        ws.on('close', () => {
            roomClients.delete(uuid);
            console.log(`roomClients : ${roomClients.size}`);
        });

        const data = await pool.query(
            '\
            select username, count(*) as room_member_counts \
            from users, rooms, room_member \
            where users.user_id = rooms.parent_id \
            and rooms.room_id = room_member.room_id \
            group by username'
        );
        ws.send(JSON.stringify(data[0]));
        ws.on('message', async (messageData) => {
            const message = JSON.parse(messageData);
            try {
                if (message.hasOwnProperty('createRoom')) {
                    const userId = await nameToId(message.createRoom);
                    await createRoom(userId, JSON.stringify(message.ratio));
                    roomClients.forEach((client) => {
                        client.send(JSON.stringify({ newRoom: message.createRoom }));
                    });
                    const roomId = await getRow('rooms', 'room_id', 'parent_id', userId);
                    playClients[roomId] = {};
                    playDatas[roomId] = { skip: 0 };
                } else if (message.hasOwnProperty('deleteRoom')) {
                    //消す処理
                    const parentId = await nameToId(message.deleteRoom);
                    await deleteRoom(parentId);
                    hideRoom(message.deleteRoom);
                }
            } catch (err) {
                console.error('Error :' + err);
            }
        });
    } else if (url.startsWith('/play')) {
        //切断したら配列から削除
        let username;
        let userId;
        let parentId;
        let roomId;
        let parentName = url.split('/')[2];

        ws.on('close', () => {
            //ちゃんと退出しなかった人用
            try {
                delete playClients[roomId][username];
            } catch (err) {}
        });

        ws.on('message', async (messageData) => {
            const message = JSON.parse(messageData);
            console.log(`/play message : ${Object.keys(message)}`);
            if (message.hasOwnProperty('entryRoom')) {
                //色々データ取得
                parentId = await nameToId(message.entryRoom);
                roomId = await getRow('rooms', 'room_id', 'parent_id', parentId);
                username = message.username;
                userId = await getRow('users', 'user_id', 'username', username);

                //playClientsに保存
                playClients[roomId][username] = ws;

                //自分に品詞の割合を送信
                const ratio = await getRow('rooms', 'ratio', 'parent_id', parentId);
                ws.send(JSON.stringify({ tangoRatio: JSON.parse(ratio) }));

                await entryRoom(roomId, userId);
                const roomMemberCounts = await getRoomMemberCounts(roomId);
                roomClients.forEach((roomClient) => {
                    roomClient.send(
                        JSON.stringify({
                            entryRoom: message.entryRoom,
                            roomMemberCounts: roomMemberCounts,
                        })
                    );
                });

                //roomMemberのデータを送信
                const roomMembers = await getRoomMembers(roomId);
                Object.values(playClients[roomId]).forEach((memberWs) => {
                    memberWs.send(JSON.stringify({ roomMembers: roomMembers[0] }));
                });
            } else if (message.hasOwnProperty('outRoom')) {
                //playClientsから削除
                delete [roomId][username];

                if (message.outRoom == username) {
                    hideRoom(message.outRoom);

                    //他の人も強制退出させる処理
                    await pool.query('delete from room_member where user_id = ?', [userId]);
                    Object.values(playClients[roomId]).forEach((memberWs) => {
                        memberWs.send(JSON.stringify({ forcedFinish: true }));
                    });
                    await pool.query('delete from room_member where room_id = ?', [roomId]);
                    await deleteRoom(parentId);
                    delete playClients[roomId];
                    delete playDatas[roomId];
                } else {
                    await pool.query('delete from room_member where user_id = ?', [userId]);
                    console.log(roomId);
                    const roomMemberCounts = await getRoomMemberCounts(roomId);
                    console.log(roomMemberCounts);
                    roomClients.forEach(async (client) => {
                        client.send(
                            JSON.stringify({
                                outRoom: message.outRoom,
                                roomMemberCounts: roomMemberCounts,
                            })
                        );
                    });

                    //roomMemberのデータを送信
                    const roomMembers = await getRoomMembers(roomId);
                    Object.values(playClients[roomId]).forEach((memberWs) => {
                        memberWs.send(JSON.stringify({ roomMembers: roomMembers[0] }));
                    });
                }
            } else if (message.hasOwnProperty('throwHai')) {
                playDatas[roomId].skip = 0;
                Object.values(playClients[roomId]).forEach((memberWs) => {
                    memberWs.send(
                        JSON.stringify({
                            throwHai: message.throwHai,
                            isBark: message.isBark,
                            targetNumber: message.targetNumber,
                        })
                    );
                });
            } else if (message.hasOwnProperty('bark')) {
                Object.values(playClients[roomId]).forEach((memberWs) => {
                    memberWs.send(JSON.stringify({ bark: message.bark }));
                });
            } else if (message.hasOwnProperty('skip')) {
                playDatas[roomId].skip++;
                if (playDatas[roomId].skip >= (await getRoomMemberCounts(roomId)) - 1) {
                    Object.values(playClients[roomId]).forEach((memberWs) => {
                        memberWs.send(JSON.stringify({ skip: true }));
                    });
                }
            } else if (message.hasOwnProperty('complete')) {
                Object.values(playClients[roomId]).forEach((memberWs) => {
                    memberWs.send(
                        JSON.stringify({
                            complete: message.complete,
                            username: message.username,
                        })
                    );
                });
            }
        });
    }
});

function hideRoom(roomName) {
    roomClients.forEach((client) => {
        client.send(JSON.stringify({ deleteRoom: roomName }));
    });
}

async function getRoomMembers(roomId) {
    const roomMembers = await pool.query(
        '\
        select username from users, room_member \
        where users.user_id = room_member.user_id \
        and room_member.room_id = ? \
        order by created_at',
        [roomId]
    );
    return roomMembers;
}

app.get('/', async (req, res) => {
    const userId = req.cookies.userId;
    if (await checkValue('users', 'user_id', userId)) {
        res.redirect('/room');
    } else {
        res.render('pages/index');
    }
});

app.get('/room', async (req, res) => {
    loginCheck(req, res);
    try {
        res.render('pages/room', {
            name: await getRow('users', 'username', 'user_id', req.cookies.userId),
        });
    } catch (err) {
        console.log(`Error : ${err}`);
    }
});

app.get('/roomkensaku', async (req, res) => {
    try {
        res.render('pages/roomkensaku'); // ← views/pages/roomkensaku.ejs を表示
    } catch (err) {
        console.log(`Error : ${err}`);
        res.redirect('/room');
    }
});

app.get('/play/:parentName', async (req, res) => {
    try {
        const parentId = await nameToId(req.params.parentName);
        if ((await checkValue('rooms', 'parent_id', parentId)) == 0) res.redirect('/room');

        const username = await idToName(req.cookies.userId);
        res.render('pages/play', { username: username });
    } catch (err) {
        console.log(`Error :${err}`);
        res.redirect('/room');
    }
});

app.get('/deleteUser', async (req, res) => {
    await loginCheck(req, res);

    try {
        await deleteUser(req.cookies.userId);

        res.clearCookie('userId', { path: '/' });
        res.redirect('/');
    } catch (err) {
        console.log(`Error :${err}`);
    }
});

app.get('/logout', async (req, res) => {
    await loginCheck(req, res);

    try {
        res.clearCookie('userId', { path: '/' });
        res.redirect('/');
    } catch (err) {
        console.log(`Error :${err}`);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if ((await checkValue('users', 'username', username)) == 1 && (await checkValue('users', 'password', password)) == 1) {
            await savelogin(res, username);
            res.json({ success: true });
        } else {
            res.json({
                success: false,
                error: 'ユーザー名またはパスワードが間違っています',
            });
        }
    } catch (err) {
        console.log(`Error :${err}`);
        res.json({ success: false, error: err });
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        if ((await checkValue('users', 'username', username)) == 1) {
            res.json({ success: false, error: 'ユーザー名が既に使われています' });
        } else {
            await addUser(username, password);
            await savelogin(res, username);
            res.json({ success: true });
        }
    } catch (err) {
        console.log(`Error :${err}`);
        res.json({ success: false, error: err });
    }
});

app.post('/play/:parentName', async (req, res) => {
    if (req.body.hasOwnProperty('roomClose')) {
        hideRoom(req.params.parentName);
        const result = await pool.query(
            'select room_id from rooms, users \
            where rooms.parent_id = users.user_id \
            and users.username = ?',
            [req.params.parentName]
        );
        Object.values(playClients[result[0][0]['room_id']]).forEach((client) => {
            client.send(JSON.stringify({ start: true }));
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

async function savelogin(res, username) {
    const userId = await nameToId(username);
    res.cookie('userId', userId, {
        maxAge: 259200000,
        httpOnly: true,
        path: '/',
    });
}

async function loginCheck(req, res) {
    const userId = req.cookies.userId;
    if ((await checkValue('users', 'user_id', userId)) == 0) {
        res.redirect('/');
    }
}

async function createRoom(parentId, ratio) {
    await pool.query('insert into rooms (parent_id, ratio) values(?, ?)', [parentId, ratio]);
}

async function entryRoom(room_id, userId) {
    await pool.query('insert into room_member (room_id, user_id) values(?,?)', [room_id, userId]);
}

async function getRoomMemberCounts(roomId) {
    const result = await pool.query('select count(*) from room_member where room_id = ?', [roomId]);
    return result[0][0]['count(*)'];
}

async function deleteRoom(parentId) {
    await pool.query(`delete from rooms where parent_id = ?`, [parentId]);
}

async function checkValue(tableName, fieldName, value) {
    const result = await pool.query(`select count(*) from ${tableName} where ${fieldName} = '${value}'`);
    return result[0][0]['count(*)'];
}

async function addUser(username, password) {
    await pool.query('insert into users (user_id, username, password) values(uuid(),?,?);', [username, password]);
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