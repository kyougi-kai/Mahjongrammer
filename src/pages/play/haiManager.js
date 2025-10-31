import { DM } from './dataManager.js';

export class haiManager {
    constructor() {
        this.datamanager = new DM();
        this.doraNum = 5;
    }

    generateHais(playerCount, ratio, turn) {
        console.log('generateHais', playerCount, ratio, turn);
        const hais = this.pickHai(playerCount, turn * playerCount, ratio);
        const doras = this.pickDora(hais);
        return { hais, doras };
    }

    pickHai(playerCount, size = 10, ratio) {
        let hais = [];
        this.datamanager.updateRatio(ratio);
        for (let i = 0; i < playerCount * 7 + size; i++) {
            hais.push(this.datamanager.pickTango());
        }

        return hais;
    }

    pickDora(hais) {
        let doras = [];
        let temporaryHais = [...hais];
        for (let i = 0; i < this.doraNum; i++) {
            let dora = temporaryHais.splice(Math.floor(Math.random() * temporaryHais.length), 1)[0];
            doras.push(dora);
        }
        return doras;
    }
}
