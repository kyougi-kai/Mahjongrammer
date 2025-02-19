class HM{
    constructor(){
        
    }

    CreateHai(tango){
        const hai = document.createElement("div");
        const tangoText = document.createElement("p");
        tangoText.innerHTML = tango;
        tangoText.style.margin = "0";
        tangoText.style.textAlign = "center"; 
        hai.appendChild(tangoText);
        hai.style.width = "200px";
        hai.style.height = "30px";
        hai.style.border="1px solid black";
        return hai;
    }

    upHai(targetHai){
        const tangoText = targetHai.children[0].innerHTML;
        let oomoji = tangoText.slice(0, 1);
        oomoji = oomoji.toUpperCase();
        targetHai.children[0].innerHTML = oomoji + tangoText.slice(1);
    }
    
    downHai(targetHai){
        const tangoText = targetHai.children[0].innerHTML;
        let komoji = tangoText.slice(0, 1);
        komoji = komoji.toLowerCase();
        targetHai.children[0].innerHTML = komoji + tangoText.slice(1);
    }
}