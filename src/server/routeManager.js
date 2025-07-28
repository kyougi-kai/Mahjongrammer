import { roomManager } from '../pages/roomManager.js';
import { cookieManager } from '../utils/cookieManager.js';
import { serverManager } from './serverManager.js';
import { usersManager } from '../server/usersManager.js';
import roomsDB from '../db/repositories/roomsRepository.js';
import roomMemberDB from '../db/repositories/roomMemberRepository.js';

export class routeManager {
    /**
     *
     * @param {serverManager} serverManager
     */
    constructor(serverManager) {
        this.serverManager = serverManager;

        this.postHandlers = new Map();

        this.setUpRoutingGet();
        this.setUpRoutingPost();
    }

    /**
     *
     * @param {string} type -postのタイプ-
     * @param {Function} handler -行う処理-
     */
    onPost(type, handler) {
        this.postHandlers.get(type) === undefined ? this.postHandlers.set(type, [handler]) : this.postHandlers.get(type).push(handler);
    }

    /**
     * ハンドラーを全てデータ付きで実行
     * @param {Array<Function>} handlers -実行する関数の配列-
     * @param {*} payload -送るデータ-
     */
    async _doHandlers(handlers, data) {
        if (handlers === undefined) return;
        for (let i = 0; i < handlers.length; i++) {
            await handlers[i](data);
        }
    }

    setUpRoutingGet() {
        this.serverManager.onGet('/', async (req, res) => {
            const userId = req.cookies.userId;
            if (userId === undefined) res.render('pages/index');
            else (await usersManager.isUserById(userId)) ? res.render('pages/index') : res.redirect('/home');
        });

        this.serverManager.onGet('/roomkensaku', async (req, res) => {
            await usersManager.isLogin(req, res);
            try {
                res.render('pages/roomkensaku', {
                    name: await usersManager.idToName(req.cookies.userId),
                    userId: req.cookies.userId,
                });
            } catch (err) {
                console.log(`Error : ${err}`);
            }
        });

        this.serverManager.onGet('/home', async (req, res) => {
            await usersManager.isLogin(req, res);
            try {
                res.render('pages/home', {
                    name: await usersManager.idToName(req.cookies.userId),
                    userId: req.cookies.userId,
                });
            } catch (err) {
                console.log(`Error : ${err}`);
            }
        });

        this.serverManager.onGet('/play/:roomId', async (req, res) => {
            try {
                await usersManager.isLogin(req, res);
                const roomId = req.params.roomId;
                if (await !roomManager.isRoomByRoomId(roomId)) res.redirect('/home');

                const username = await usersManager.idToName(req.cookies.userId);
                res.render('pages/play', { username: username, userId: req.cookies.userId });
            } catch (err) {
                console.log(`Error :${err}`);
                res.redirect('/home');
            }
        });

        this.serverManager.onGet('/room/:roomId', async (req, res) => {
            try {
                await usersManager.isLogin(req, res);
                const roomId = req.params.roomId;
                if (await !roomManager.isRoomByRoomId(roomId)) res.redirect('/home');

                const username = await usersManager.idToName(req.cookies.userId);
                const roomName = await roomsDB.getRow('room_name', 'room_id', roomId);
                res.render('pages/room', { username: username, userId: req.cookies.userId, roomName: roomName });
            } catch (err) {
                console.log(`Error /room :${err}`);
                res.redirect('/home');
            }
        });

        this.serverManager.onGet('/deleteUser', async (req, res) => {
            await usersManager.isLogin(req, res);

            try {
                await usersManager.deleteUser(req.cookies.userId);
                cookieManager.deleteCookie(res, 'userId');
                res.redirect('/');
            } catch (err) {
                console.log(`Error :${err}`);
            }
        });

        this.serverManager.onGet('/logout', async (req, res) => {
            await usersManager.isLogin(req, res);

            try {
                cookieManager.deleteCookie(res, 'userId');
                res.redirect('/');
            } catch (err) {
                console.log(`Error :${err}`);
            }
        });
    }

    setUpRoutingPost() {
        this.serverManager.onPost('/post', async (req, res) => {
            console.log('post通信が呼ばれました');
            const payload = req.query;
            await this._doHandlers(this.postHandlers.get(payload.type), payload);

            res.sendStatus(204);
        });

        this.serverManager.onPost('/login', async (req, res) => {
            const { username, password } = req.body;
            try {
                if (await usersManager.loginCheck(username, password)) {
                    const userId = await usersManager.nameToId(username);
                    await cookieManager.saveCookie(res, 'userId', userId);
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

        this.serverManager.onPost('/signin', async (req, res) => {
            const { username, password } = req.body;
            try {
                const addUserResult = await usersManager.addUser(username, password);
                if (addUserResult) {
                    const userId = await usersManager.nameToId(username);
                    cookieManager.saveCookie(res, 'userId', userId);
                    res.json({ success: true });
                } else res.json({ success: false, error: 'ユーザー名が既に使われています' });
            } catch (err) {
                res.json({ success: false, error: err });
            }
        });
    }
}
