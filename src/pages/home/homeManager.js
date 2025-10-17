import userColorDB from '../../db/repositories/userColorRepository.js';

export class homeManager {
    constructor(wss) {
        this.wss = wss;
        this.wss.onMessage('changeColor', async (ws, data) => {
            await userColorDB.updateColor(data.color, data.userId);
        });

        // クライアントがホームに入ったときに現在の色を返す
        this.wss.onMessage('entryHome', async (ws, data) => {
            const userId = data.userId;
            const color = await userColorDB.getRow('color', 'user_id', userId);
            const sendData = {
                type: 'setColor',
                payload: { color: color },
            };
            ws.send(JSON.stringify(sendData));
        });

        
    }
}
