/*
接続のことだけ考える
・接続できる
・メッセージを受け取ったときに設定された関数を呼び出す
・決められた形式でメッセージを送ることができる
*/
export class connectionManager {
    constructor() {
        this.openHandlers = [];
        this.messageHandlers = new Map();
    }

    // openした時に行う処理を登録
    onOpen(handler) {
        this.openHandlers.push(handler);
    }

    //messageを受け取ったときに行う処理を登録
    onMessage(type, handler) {
        this.messageHandlers.get(type) === undefined ? this.messageHandlers.set(type, [handler]) : this.messageHandlers.get(type).push(handler);
    }

    //websocketのセットアップをする
    connect(url) {
        this.ws = new WebSocket(url);
        this._setUpEventListeners();
    }

    //イベント発生時の処理を設定
    _setUpEventListeners() {
        this.ws.onopen = (event) => this._doHandlers(this.openHandlers, null);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this._doHandlers(this.messageHandlers.get(data.type), data.payload);
        };
    }

    /**
     * ハンドラーを全てデータ付きで実行
     * @param {Array<Function>} handlers -実行する関数の配列-
     * @param {*} payload -送るデータ-
     */
    _doHandlers(handlers, data) {
        if (handlers === undefined) return;
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](data);
        }
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}
