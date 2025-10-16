import { DM } from './dataManager.js';

export class haiManager {
    constructor() {
        this.datamanager = new DM();
        this.maxHai = 10;
        this.doraNum = 5;
    }

    generateHais(playerCount, size = 10, ratio) {
        let hais = [];
        this.datamanager.updateRatio(ratio);
        for (let i = 0; i < playerCount * 7 + size; i++) {
            hais.push(this.datamanager.pickTango());
        }

        return hais;
    }

    pickDora() {}
}
