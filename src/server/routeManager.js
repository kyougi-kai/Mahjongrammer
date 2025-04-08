import { serverManager } from './serverManager.js';
import { usersRepository } from '../db/repositories/usersRepository.js';
const usersrepository = new usersRepository();

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
            try {
                (await usersrepository.isNull('user_id', userId)) ? res.render('pages/index') : res.redirect('/room');
            } catch (err) {
                res.render('pages/index');
            }
        });

        /*
        this.serverManager.onGet('/room', async (req, res) => {
            loginCheck(req, res);
            try {
                res.render('pages/room', {
                    name: await getRow('users', 'username', 'user_id', req.cookies.userId),
                });
            } catch (err) {
                console.log(`Error : ${err}`);
            }
        });

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

        this.serverManager.onGet('/deleteUser', async (req, res) => {
            await loginCheck(req, res);

            try {
                await deleteUser(req.cookies.userId);

                res.clearCookie('userId', { path: '/' });
                res.redirect('/');
            } catch (err) {
                console.log(`Error :${err}`);
            }
        });

        this.serverManager.onGet('/logout', async (req, res) => {
            await loginCheck(req, res);

            try {
                res.clearCookie('userId', { path: '/' });
                res.redirect('/');
            } catch (err) {
                console.log(`Error :${err}`);
            }
        });
        */
    }

    setUpRoutingPost() {
        /*
        this.serverManager.onPost('/login', async (req, res) => {
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

        this.serverManager.onPost('/signin', async (req, res) => {
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
