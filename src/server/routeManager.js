import { cookieManager } from '../utils/cookieManager.js';
import { serverManager } from './serverManager.js';
import { usersManager } from './usersManager.js';

export class routeManager {
    /**
     *
     * @param {serverManager} serverManager
     */
    constructor(serverManager) {
        this.serverManager = serverManager;

        this.setUpRoutingGet();
        this.setUpRoutingPost();
    }

    setUpRoutingGet() {
        this.serverManager.onGet('/', async (req, res) => {
            const userId = req.cookies.userId;
            if (userId === undefined) res.render('pages/index');
            else (await usersManager.isUserById(userId)) ? res.render('pages/index') : res.redirect('/room');
        });

        this.serverManager.onGet('/room', async (req, res) => {
            await usersManager.isLogin(req, res);
            try {
                res.render('pages/room', {
                    name: await usersManager.idToName(req.cookies.userId),
                });
            } catch (err) {
                console.log(`Error : ${err}`);
            }
        });

        /*

        this.serverManager.onGet('/play/:parentName', async (req, res) => {
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
        */
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

        /*

        this.serverManager.onPost('/play/:parentName', async (req, res) => {
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
        */
    }
}
