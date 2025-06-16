export class toGoOut {
    constructor(){
        this.sentenceList = {
            sv: 1,
            svm: 1,
            svc: 2,
            svcm: 2,
            svo: 3,
            svom: 3,
            svoo: 4,
            svoom: 4,
            svoc: 5,
            svocm: 5,
        };

        this.checkList = Object.keys(this.sentenceList);

        document.addEventListener('keydown', (e) => {
            if (e.key == 'p') {
                tumoreruka();
            }
        });
    }
    
    
    tumoreruka(){
        console.log('つもれるか？');
        let table = document.getElementById("wordUp");

        // 白の数を数えて 0ならfalseを返す
        let wc = table.childElementCount;
        if (wc == 0) return false;

        // 1個1個白の中を見て sとかvとか 一つの文字列にまとめる  sv svo
        for(let i = 0;i < wc; i++){
            let grammerString = "";
            Array.from(table.children[i].children).forEach(value => {
                grammerString += this.grammerToString(value);
            });
            console.log(grammerString);
            // this.checkList.indexOf(table.children[i])
        }
    }

    grammerToString(element){
        const checkList = [['division-s', 's'],['division-v', 'v'], ['division-o', 'o'], ['division-c', 'c'], ['division-m', 'm']];

        for(let i = 0; i < checkList.length; i++){
            if(element.classList.contain(value[0])){
                return value[1];
            }
        }
    }

    tumo(){

    }
}