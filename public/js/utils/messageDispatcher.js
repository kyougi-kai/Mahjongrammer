export class messageDispatcher {
    constructor() {
        this.handlers = new Map();
    }

    register(messageType, handler) {
        this.handlers.set(messageType, handler);
    }

    /**
     * dataの構造は
     * {
     *     type:'eventName',
     *     payload:{
     *         example:data
     *     }
     * }
     */
    dispatch(message) {
        const data = JSON.parse(message.data);
        const handler = this.handlers.get(data.type);
        handler(data.payload);
    }
}
