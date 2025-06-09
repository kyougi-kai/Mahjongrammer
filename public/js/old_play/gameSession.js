/* ゲームのセッションの情報を管理する
・部屋の情報
・入退出の処理
*/
export class gameSession {
    constructor(connection) {
        this.protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.players = [];
        this.ownName = document.getElementById('usernameText').textContent.replace(/\s+/g, '');
        this.parentName = decodeURIComponent(window.location.pathname).split('/')[2];
        this.connection = connection;
    }

    entryRoom() {
        this.connection.send({
            type: 'entoryRoom',
            payload: { roomName: parentName, username: username },
        });
    }

    getConnectionUrl() {
        return `${this.protocol}://${window.location.host}/play/${this.parentName}`;
    }
}
