export class flow {
    constructor(){
        
    }
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
                this.tumoreruka();
            }
        });
tumoreruka(){
    this.table = document.getElementById("wordUp");
    console.log(this.table.childElementCount);
}

tumo(){

}
}