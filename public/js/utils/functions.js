export class functions {
    constructor() {}

    static sN(target) {
        return target.replace(/\s+/g, '');
    }

    static async translateEnglish(sentence) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=en|ja`;
        const res = await fetch(url);
        const data = await res.json();
        const jp = data.responseData.translatedText || '（翻訳失敗）';

        return jp;
    }
}
