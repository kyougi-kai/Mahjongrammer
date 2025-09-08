import { DM } from './dataManager.js';

export class haiManager {
    constructor() {
        this.datamanager = new DM();
    }

    generateHais(playerCount, size = 10) {
        let hais = [];
        for (let i = 0; i < playerCount * 7 + size; i++) {
            hais.push(this.datamanager.pickTango());
        }

        return hais;
    }
}
