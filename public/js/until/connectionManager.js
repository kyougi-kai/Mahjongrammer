/*
接続のことだけ考える
・接続できる
・メッセージを受け取ったときに設定された関数を呼び出す
・決められた形式でメッセージを送ることができる
*/
export class connectionManager {
    constructor(url) {
        this.url = url;
        this.openHandlers = [];
        this.messageHandlers = [];
    }

    // openした時に行う処理を登録
    onOpen(handler) {
        this.openHandlers.push(handler);
    }

    //messageを受け取ったときに行う処理を登録
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    //websocketのセットアップをする
    connect() {
        this.ws = new WebSocket(this.url);
        this._setUpEventListeners();
    }

    //イベント発生時の処理を設定
    _setUpEventListeners() {
        this.ws.onopen = (event) => this._doHandlers(this.openHandlers, null);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this._doHandlers(this.openHandlers, data);
        };
    }

    /**
     * ハンドラーを全てデータ付きで実行
     * @param {Array<Function>} handlers -実行する関数の配列-
     * @param {*} payload -送るデータ-
     */
    _doHandlers(handlers, data) {
        handlers.forEach((handler) => handler(data));
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }
}
