import { WebSocketServer } from 'ws';
import roomsDB from '../db/repositories/roomsRepository.js';

/*
接続のことだけ考える
・接続できる
・メッセージを受け取ったときに設定された関数を呼び出す
・決められた形式でメッセージを送ることができる
*/
export class connectionManager {
    constructor() {
        this.getHandlers = new Map();
        this.closeHandlers = new Map();
        this.messageHandlers = new Map();
    }

    // websocketのセットアップをする
    connect(server) {
        this.server = server;
        const wss = new WebSocketServer({ server });

        wss.on('connection', async (ws, req) => {
            const url = req.url;
            // urlに対応した処理を実行
            this._doHanlders(this.getHandlers.get(url), ws, null);

            ws.on('close', () => {
                this._doHanlders(this.closeHandlers.get(url), ws, null);
            });

            ws.on('message', async (data) => {
                const parseData = JSON.parse(data);
                await this._doHanlders(this.messageHandlers.get(parseData['type']), ws, parseData['payload']);

                if (parseData['type'] == 'createRoom') {
                    const roomId = await roomsDB.getRoomId(parseData['payload']['userId']);
                    const sendSuccess = {
                        type: 'success',
                        payload: {
                            type: parseData['type'],
                            roomId: roomId,
                        },
                    };
                    ws.send(JSON.stringify(sendSuccess));
                } else {
                    const roomId = null;
                    const sendSuccess = {
                        type: 'success',
                        payload: {
                            type: parseData['type'],
                            roomId: roomId,
                        },
                    };
                    ws.send(JSON.stringify(sendSuccess));
                }
            });
        });
    }

    // ここでメッセージが遅れたことを送る

    /**
     *
     * @param {string} url -受け取るurl-
     * @param {Function} handler -行う処理-
     */
    onGet(url, handler) {
        this.getHandlers.get(url) === undefined ? this.getHandlers.set(url, [handler]) : this.getHandlers.get(url).push(handler);
    }

    /**
     *
     * @param {string} url -受け取るurl-
     * @param {Function} handler -行う処理-
     */
    onClose(url, handler) {
        this.closeHandlers.get(url) === undefined ? this.closeHandlers.set(url, [handler]) : this.closeHandlers.get(url).push(handler);
    }

    /**
     *
     * @param {string} type -受け取るメッセージタイプ-
     * @param {Function} handler -行う処理-
     */
    onMessage(type, handler, priority = 0) {
        if (this.messageHandlers.get(type) === undefined) {
            const setData = {};
            setData[priority] = [handler];
            this.messageHandlers.set(type, setData);
        } else {
            this.messageHandlers.get(type).hasOwnProperty(priority)
                ? this.messageHandlers.get(type)[priority].push(handler)
                : (this.messageHandlers.get(type)[priority] = [handler]);
        }
    }

    async _doHanlders(handlers, ws, sendData = null) {
        if (handlers === undefined) return;
        if (typeof handlers == String) handlers(ws, sendData);
        else {
            if (Array.isArray(handlers)) {
                for (let i = 0; i < handlers.length; i++) {
                    await handlers[i](ws, sendData);
                }
            } else {
                const keys = Object.keys(handlers);
                for (let i = 0; i < keys.length; i++) {
                    for (let j = 0; j < keys[i].length; j++) {
                        await handlers[keys[i]][j](ws, sendData);
                    }
                }
            }
        }
    }
}
