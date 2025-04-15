import { WebSocketServer } from 'ws';

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
            this._doHanlders(this.getHandlers.get(url), ws);
            ws.on('close', () => {
                this._doHanlders(this.closeHandlers.get);
            });
        });
    }

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
     * @param {string} url -受け取るurl-
     * @param {Function} handler -行う処理-
     */
    onClose(url, handler) {
        this.messageHandlers.get(url) === undefined ? this.messageHandlers.set(url, [handler]) : this.messageHandlers.get(url).push(handler);
    }

    _doHanlders(handlers, ws) {
        typeof handlers == String ? handlers(ws) : handlers.forEach((hanlder) => hanlder(ws));
    }
}
