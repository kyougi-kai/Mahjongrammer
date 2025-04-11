export class cookieManager {
    constructor() {}

    static saveCookie(res, key, value, maxAge = 259200000) {
        res.cookie(key, value, {
            maxAge: maxAge,
            httpOnly: true,
            path: '/',
        });
    }

    static deleteCookie(res, key) {
        res.clearCookie(key, { path: '/' });
    }
}
