export class tekitou {
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
        document.addEventListener('keydown', (e) => {
            if (e.key == 'p') {
                tumoreruka();
            }
        });
    }
    
    
    tumoreruka(){
        this.table = document.getElementById("wordUp");
        console.log(this.table.childElementCount);
        if(this.table.childElementCount == 1){
            this.firstSen = this.table.children[0];
        }else if (this.table.childElementCount == 2){
            this.firstSen = this.table.children[0];
            this.secondSen = this.table.children[1];
        }else if (this.table.childElementCount == 3){
            this.firstSen = this.table.children[0];
            this.secondSen = this.table.children[1];
            this.thirdSen = this.table.children[2];
        }else if (this.table.childElementCount == 3){
            this.firstSen = this.table.children[0];
            this.secondSen = this.table.children[1];
            this.thirdSen = this.table.children[2];
        }else{
            this.firstSen = this.table.children[0];
            this.secondSen = this.table.children[1];
            this.thirdSen = this.table.children[2];
            this.fourthSen = this.table.children[3];
        }
    }
    tumo(){

    }
}