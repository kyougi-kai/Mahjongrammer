class GM{
    constructor(numberOfPlayer, maxHai, dm){
        this._numberOfPlayer = numberOfPlayer;
        this._wariai = dm.wariai;
        this._maxHai = maxHai;
        this._wakus = [];
        this._focusHai = null;
        this._nowPhase = -1;
        this._DM = dm;
        this._HM = new HM();

        //捨てるボタン
        this._throwButton = document.createElement("button");
        this._throwButton.innerHTML = "捨てる";
        this._throwButton.style.display = "none";
        this._throwButton.setAttribute("onclick", "_gm.clickThrow();");
        //入力された人数分Haiのコマ追加するやつを使ってmaxHai-1こ全員に配る
        this._mainDiv = document.createElement("div");
        this._mainDiv.style.display = "flex";
        this._mainDiv.style.flexWrap = "wrap";
        document.body.appendChild(this._mainDiv);
        for(let i = 0; i < numberOfPlayer; i++){
            let waku = document.createElement("div");
            let temporaytext = document.createElement("p");
            temporaytext.innerHTML = "0";
            waku.appendChild(temporaytext);
            waku.style.border = "1px solid black";
            waku.style.height = "30px";
            waku.style.margin = "4px 2px";
            waku.style.display = "flex";
            this._mainDiv.appendChild(waku);
            this._wakus.push(waku);

            for(let j = 0; j < maxHai - 1; j++){
                const temporaryHai = this._HM.CreateHai(this._DM.pickTango());
                if(j == 0)this._HM.upHai(temporaryHai);
                waku.appendChild(temporaryHai);
                temporaryHai.setAttribute("onclick", "_gm.clickHai(this);")
            }
        }

        let temporaryDiv = document.createElement("div");
        temporaryDiv.appendChild(this._throwButton);
        temporaryDiv.style.width = "100%";
        this._mainDiv.appendChild(temporaryDiv);
        this.nextPhase();
    }

    get DM(){
        return this._DM;
    }

    nextPhase(){
        this._nowPhase = (this._nowPhase + 1) % this._numberOfPlayer;
        const temporaryHai = this._HM.CreateHai(this._DM.pickTango());
        this._wakus[this._nowPhase].appendChild(temporaryHai);
        temporaryHai.setAttribute("onclick", "_gm.clickHai(this);")
        this._throwButton.style.display = "block";
    }

    clickThrow(){
        if(this._focusHai != null){
            if(this.idexHai(this._focusHai)[1] == 1){
                this._HM.upHai(this._wakus[this._nowPhase].children[2]);
            }

            this._focusHai.remove();
            this._focusHai = null;
            this._wakus[this._nowPhase].children[0].innerHTML = parseInt(this._wakus[this._nowPhase].children[0].innerHTML) + 1;
            this.nextPhase();
        }
    }

    clickHai(clickElement){
        if(this._focusHai == null && this.idexHai(clickElement)[0] == this._nowPhase){
            this._focusHai = clickElement;
            this._focusHai.style.border = "1px solid red";
        }
        else if(this._focusHai == clickElement)
        {
            this._focusHai.style.border = "1px solid black";
            this._focusHai = null;
        }
        else if(this.idexHai(this._focusHai)[0] == this.idexHai(clickElement)[0]){
            let temporaryText = this._focusHai.children[0].innerHTML;
            this._focusHai.children[0].innerHTML = clickElement.children[0].innerHTML;
            clickElement.children[0].innerHTML = temporaryText;
            this._focusHai.style.border = "1px solid black";

            if(this.idexHai(this._focusHai)[1] == 1){
                this._HM.downHai(clickElement);
                this._HM.upHai(this._focusHai);
            }

            if(this.idexHai(clickElement)[1] == 1){
                this._HM.downHai(this._focusHai);
                this._HM.upHai(clickElement);
            }

            this._focusHai = null;
        }
        else if(this._focusHai != null){
            this._focusHai.style.border = "1px solid black";
            this._focusHai = null;
        }
    }

    idexHai(targetHai){
        let returnArray = [-1, -1];
        this._wakus.forEach((waku, cnt) =>{
            let idx = Array.from(waku.children).indexOf(targetHai);
            if(idx != -1){
                returnArray = [cnt, idx];
            }
        });
        return returnArray;
    }
}
