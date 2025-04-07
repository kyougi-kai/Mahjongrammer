/*
接続のことだけ考える
・接続できる
・メッセージを受け取ったときに設定された関数
*/

export class connectionManager {
    constructor(url) {
        this.url = new WebSocket(`${protocol}://${window.location.host}/play/${parentName}`);
    }
}
