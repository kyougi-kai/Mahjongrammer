import userColorDB from '../../db/repositories/userColorRepository.js';

export class homeManager {
    constructor(wss) {
        this.wss = wss;
        this.wss.onMessage('changeColor', async (ws, data) => {
            await userColorDB.updateColor(data.color, data.userId);
        });
    }
}
