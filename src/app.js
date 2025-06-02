import { serverManager } from './server/serverManager.js';
import { routeManager } from './server/routeManager.js';

const servermanager = new serverManager();
const routemanager = new routeManager(servermanager);
export {routemanager};

servermanager.start(() => {
    console.log('サーバー起動');
});

/*

wss.on('connection', async (ws, req) => {
    const url = req.url;

    if (url === '/room') {
        ws.on('message', async (messageData) => {
            const message = JSON.parse(messageData);
            try {if (message.hasOwnProperty('deleteRoom')) {
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
            if (message.hasOwnProperty('throwHai')) {
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

*/
