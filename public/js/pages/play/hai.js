/*
・牌ができる
・持ち場を移動
・wordData.js参照してwordから品詞をだしてなんか変数に保存する
・/publicがルートディレクトリ
*/

export class hai {
    constructor(word) {
        this.word = word;

        // wordData.js と wordで品詞とる
        // this.hinsi =

        document.onkeydown = (e) => {
            if (e.key == 'a') {
                this.createHai();
            }
        };
    }

    // 牌ができる！戻り値牌の要素
    // バックグラウンドに画像を貼る
    // 文字を真ん中に見やすいように表示する
    createHai() {
        const hai = document.createElement('div');
        hai.innerHTML = this.word;
        hai.classList.add('border-div');
        // haiの見た目を牌にする haiManager.js showHai観ながら

        // 後ろに画像表示

        // 文字をいい感じに表示

        return hai;
    }
}

/*

関数の省略形

function name(){}

() => {}


*/
