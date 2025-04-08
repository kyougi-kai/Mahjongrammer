import express from 'express';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const __dirname = import.meta.dirname;

export class serverManager {
    constructor() {
        this._expressSetUp();
        this.server = http.createServer(this.app);
    }

    _expressSetUp() {
        this.app = express();

        this.app.use(cookieParser());
        this.app.use(express.static('public'));
        this.app.use(cors());
        this.app.use(express.json());

        this.app.set('view engine', 'ejs');
        const dirname = __dirname.split('\\');
        dirname.pop();
        dirname.pop();
        this.app.set('views', path.join(dirname, 'views'));
    }

    onGet(route, handler) {
        this.app.get(route, handler);
    }

    onPost(route, handler) {
        this.app.post(route, handler);
    }

    start(handler = () => {}) {
        const PORT = process.env.PORT || 3000;
        this.server.listen(PORT, handler);
    }
}
