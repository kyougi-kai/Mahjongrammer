let _gm = null;
let startFlg = false;
let _dm = new DM(callF);
const fileNameInput = document.getElementById("fileName");
const wariaiSelect = document.getElementById("wariaiSelect");

//今度やる
function callF(){
    //ドロップダウンに追加
    _dm.data.forEach((vlist) => {
        appendOption(vlist[0]);
    });
    console.log(_dm.data);
}

function appendOption(optionName){
    let tp = document.createElement("option");
    tp.innerHTML = optionName;
    document.getElementById("wariaiSelect").appendChild(tp);
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

wariaiSelect.addEventListener("change", (e)=>{
    Array.from(document.getElementById("hinsi").children).forEach((elem, idx) => {
        if(idx % 2 == 1){
            elem.value = _dm.data[wariaiSelect.selectedIndex][parseInt(idx / 2) + 1];
        }
    });
    fileNameInput.value = _dm.data[wariaiSelect.selectedIndex][0];
});

function saveWariai(){
    let tem = [];
    let lname = fileNameInput.value;
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
        appendOption(lname);
    }
    else{
        for(let i = 1; i < _dm.data[fidx].length; i++){
            _dm.data[fidx][i] = tem[i - 1];
        }
        console.log(_dm.data);
    }

    wariaiSelect.options[Array.from(wariaiSelect.options).length - 1].selected = true;
    _dm.saveWariai();
}
