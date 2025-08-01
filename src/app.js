import { serverManager } from './server/serverManager.js';
import { routeManager } from './server/routeManager.js';

const servermanager = new serverManager();
const routemanager = new routeManager(servermanager);
export { routemanager };

servermanager.start(() => {
    console.log('サーバー起動');
});
