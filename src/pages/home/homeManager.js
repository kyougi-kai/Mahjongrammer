export class homeManager {
    constructor(wss) {
        this.wss = wss;
        this.wss.onMessage('changeColor', (data) => {});
    }
}
