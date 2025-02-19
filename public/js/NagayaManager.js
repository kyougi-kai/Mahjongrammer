class NGM {
    constructor(numberOfPlayer, maxHai, wariai){
        this._numberOfPlayer = numberOfPlayer;
        this._wariai = wariai;
        this._maxHai = maxHai;
        this._wakus = [];
        // this._DM = new DM();
        this._NHM = new NHM();
        //入力された人数分　Haiのコマ追加するやつを使ってmaxHai-1こ全員に配る
        for(let i = 1; i <= numberOfPlayer; i++){
            let waku = document.createElement("div");
            waku.style.border = "1px solid black";
            waku.style.height = "30px";
            waku.style.width = "1200px";
            waku.style.margin = "4px 2px";
            waku.style.display = "flex";
            document.body.appendChild(waku);
            this._wakus.push(waku);

            for(let j = 1; j <= maxHai - 1; j++){
                // waku.push(this._HM.CreateHai(this._DM.pickTango(this._wariai))); 割合が決まったら
                waku.appendChild(this._NHM.CreateHai("occasionally" + j,i,j));
            }
        }
    }
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

class NDM {
    constructor(wariai){
        this._wariai = [0.,];
        this._tango = {
            noun : ["dog", "school", "book", "car", "apple", "city", "teacher", "computer", "river", "mountain", "idea", "happiness", "music", "game", "house", "door", "flower", "table", "pencil", "phone"],
            verb : ["run", "eat", "sleep", "write", "read", "play", "sing", "dance", "jump", "swim", "talk", "listen", "walk", "study", "work", "watch", "draw", "open", "close", "buy"],
            adjective : ["beautiful", "big", "small", "tall", "short", "fast", "slow", "happy", "sad", "strong", "weak", "bright", "dark", "hot", "cold", "new", "old", "easy", "difficult", "interesting"],
            adverb : ["quickly", "slowly", "happily", "sadly", "loudly", "quietly", "well", "badly", "easily", "hard", "fast", "often", "sometimes", "always", "never", "here", "there", "now", "then", "soon"],
            pronoun : ["I", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their", "me", "you", "him", "her", "it", "us", "them", "mine", "yours", "his", "hers", "ours", "theirs", "we", "you", "they", "us", "them"],
            preposition : ["in", "on", "at", "by", "with", "about", "for", "from", "to", "under", "over", "between", "among", "through", "against", "around", "before", "after", "inside", "outside"],
            conjunction : ["and", "but", "or", "so", "because", "although", "if", "when", "while", "since", "until", "even though", "unless", "whereas", "as", "than", "yet", "whether", "however", "though"],
            interjection : ["Wow", "Oh", "Oops", "Aha", "Hey", "Ouch", "Yay", "Hmm", "Hooray", "Ugh", "Ah", "Bravo", "Eek", "Gosh", "Alas", "Phew", "Whoa", "Yikes", "Jeez", "Oof"],
            article : ["a", "an", "the"],
            auxiliaryVerb : ["can", "could", "will", "would", "shall", "should", "may", "might", "must", "do", "does", "did", "have", "has", "had", "am", "is", "are", "was", "were", "be"],
            quantifier : ["some", "many", "few", "several", "all", "both", "each", "every", "most", "much", "enough", "plenty", "little", "any", "no", "half", "double", "dozen", "various"],
            possessive : ["my", "your", "his", "her", "its", "our", "their", "mine", "yours", "her", "theirs"],
        }
    }

    get tango() {
        return this._tango;
    }
}

class NHM {
    constructor(){
        
    }

    CreateHai(tango,playerid,haiid){
        const hai = document.createElement("button");
        hai.textContent = tango;
        let id = playerid * 1000 + haiid; 
        hai.id = id;
        hai.style.width = "150px";
        hai.style.height = "30px";
        hai.onclick = (e) => {
            alert(e.target.id);
        }
        // hai.style.border="1px solid black";
        return hai;
    }

    ThrowHai(){
        
    }
}