let _gm = null;
let startFlg = false;
let _dm = new DM(callF);

//今度やる
function callF(){
    //ドロップダウンに追加
    _dm.data.forEach((vlist) => {
        let tp = document.createElement("option");
        tp.innerHTML = vlist[0];
       document.getElementById("wariaiSelect").appendChild(tp);
    });
    console.log(_dm.data);
}

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
        _dm.wariai = wariai;
        _gm = new GM(parseInt(document.getElementById("inputNumberOfPlayer").value), parseInt(document.getElementById("inputMaxHai").value), _dm);
    }
}

const wariaiSelect = document.getElementById("wariaiSelect");
wariaiSelect.addEventListener("change", (e)=>{

    Array.from(document.getElementById("hinsi").children).forEach((elem, idx) => {
        if(idx % 2 == 1){
            elem.value = _dm.data[wariaiSelect.selectedIndex][parseInt(idx / 2) + 1];
        }
    });
});

function saveWariai(){
    let tem = [];
    let lname = document.getElementById("fileName").value;
    Array.from(document.getElementById("hinsi").children).forEach((elem, idx) => {
        if(idx % 2 == 1){
            tem.push(elem.value);
        }
    });
    let fidx = -1;
    _dm.data.forEach((elem, idx) => {
        if(elem[0] == lname)fidx = idx;
    });

    if(fidx == -1){
        tem.unshift(lname);
        _dm.data.push(tem);
    }
    else{
        for(let i = 0; i < _dm.data[fidx].length; i++){
            _dm.data[fidx][i] = tem[i];
        }
    }

    _dm.saveWariai();
}
