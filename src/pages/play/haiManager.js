import { DM } from '../../../public/js/utils/dataManager.js';

export class haiManager {
    constructor() {
        this.datamanager = new DM();
    }

    generateHais(size = 10) {
        let hais = [];
        for (let i = 0; i < size; i++) {
            hais.push(this.datamanager.pickTango());
        }
    }
}
