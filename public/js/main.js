let _gm = null;
let _dm = null;
let startFlg = false;

function startGame(){
    if(startFlg == false) {
        startFlg = true;
        let sum = 0;
        let md =Array.from(document.getElementById("hinsi").children);
        for(let i = 1; i < md.length; i = i + 2){
            sum += parseInt(md[i].value);
        }

        let wariai = [];
        for(let i = 1; i < md.length; i = i + 2){
            wariai.push(parseInt(md[i].value) / sum);
        }
        _dm = new DM(wariai);
        _gm = new GM(parseInt(document.getElementById("inputNumberOfPlayer").value), parseInt(document.getElementById("inputMaxHai").value), _dm);
    }
}
