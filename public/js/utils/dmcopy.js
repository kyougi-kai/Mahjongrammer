class DM{
    constructor(){
        this._wariai = [1,1,1,1,1,1,1,1,1,1];
        this._partOfSpeech = ["meisi", "dousi", "keiyousi", "hukusi", "daimeisi", "zentisi", "setuzokusi", "kantansi", "kansi", "jodousi"];
        this._tango = {
            meisi : ["dog","school","book","car","apple","city","teacher","computer","river","mountain","idea","happiness","music","game","house","door","flower","table","pencil","phone","actor","actress","advice","air","airplane","airport","animal","answer","area","arm","artist","athlete","author","baby","bag","ball","banana","band","bank","bar","bath","bed","beef","beginner","bike","bird","birthday","blanket","blood","board","boat","body","book","border","bottle","box","boy","bread","brother","building","bus","cake","camera","capital","car","card","carpet","cat","center","chance","change","chicken","child","class","classroom","clothes","cloud","coffee","color","company","computer","cousin","cow","cup","desk","dog","door","down","dream","drink","drum","ear","earth","egg","engine","event","example","eye","face","family","fan","farmer","father","feet","field","file","fish","flower","foot","friend","game","garden","gate","girl","glove","goal","grandfather","grandmother","group","guide","gym","hair","hand","hat","head","heart","home","hospital","house","idea","invention","island","jacket","job","juice","key","king","kitchen","lady","lamp","land","language","laundry","law","leader","leg","library","life","light","line","lip","lock","lunch","machine","man","market","match","meal","medicine","member","menu","message","minute","mirror","money","month","movie","museum","music","name","nephew","news","night","nose","number","object","office","opinion","orange","owner","paint","paper","parent","park","pen","people","photo","picture","place","plane","plate","pool","post","prize","queen","question","radio","rain","restaurant","room","sail","salt","school","season","secretary","seed","shelf","shirt","shoe","singer","sister","snow","soccer","song","south","space","speaker","spot","star","station","stomach","student","subway","sugar","summer","sunglasses","table","tail","team","television","test","thing","thought","ticket","time","tooth","town","toy","traffic","train","transport","tree","umbrella","uncle","uniform","village","voice","water","week","wife","window","winter","woman","world","year","yellow","yoga","zoo"],
            dousi : ["am", "is", "are"],
            keiyousi : ["beautiful", "big", "small", "tall", "short", "fast", "slow", "happy", "sad", "strong", "weak", "bright", "dark", "hot", "cold", "new", "old", "easy", "difficult", "interesting"],
            hukusi : ["quickly", "slowly", "happily", "sadly", "loudly", "quietly", "well", "badly", "easily", "hard", "fast", "often", "sometimes", "always", "never", "here", "there", "now", "then", "soon"],
            daimeisi : ["I", "you", "he", "she", "we", "they", "my", "your", "his", "her", "its", "our", "their", "me", "you", "him", "her", "it", "us", "them", "mine", "yours", "his", "hers", "ours", "theirs", "we", "you", "they", "us", "them"],
            zentisi : ["in", "on", "at", "by", "with", "about", "for", "from", "to", "under", "over", "between", "among", "through", "against", "around", "before", "after", "inside", "outside"],
            setuzokusi : ["and", "but", "or", "so", "because", "although", "if", "when", "while", "since", "until", "unless", "as", "than", "yet", "whether", "however", "though"],
            kantansi : ["Wow", "Oh", "Oops"],
            kansi : ["a", "an", "the"],
            jodousi : ["can", "could", "will", "would", "shall", "should", "may", "might", "must"]
        }
        /*
        this._data = [];
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '../data.txt', true);

        xhr.onload = () => {
            if (xhr.status === 200) {
              let resData = xhr.responseText;
              resData = resData.split("\r\n");
              resData.forEach((value) => {
                this._data.push(value.split(','));
              });

              callF();
            }
        };
        xhr.send();
        */
    }

    get tango(){
        return this._tango;
    }

    set wariai(value){
        this._wariai = value;
    }

    /*
    get data(){
        return this._data;
    }
    */

    pickTango(){
        let tango = null;
        const randomValue = Math.random();
        let temporaryWariai = this._wariai.concat();
        console.log(temporaryWariai);
        temporaryWariai.forEach((value, idx)=>{
            if(idx > 0){
                temporaryWariai[idx] += temporaryWariai[idx - 1];
            }
        });

        console.log(temporaryWariai);
        
        let finishFlag = false;
        temporaryWariai.forEach((value, idx) => {
            if(randomValue <= value && !finishFlag){
                console.log(randomValue + " : " + value);
                tango = this._tango[this._partOfSpeech[idx]][Math.floor(Math.random() * this._tango[this._partOfSpeech[idx]].length)];
                finishFlag = true;
            }
        });
    
        return tango;
    }

    /*
    saveWariai(){
        let saveText = [];
        console.log(this._data);
        this._data.forEach((elem) => {
            saveText.push(elem.join(","));
        });
        saveText = saveText.join("\r\n");
        console.log(saveText);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/saveFile", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("ファイルが保存されました");
            }
        };
        xhr.send(JSON.stringify({text: saveText}));
    }
    */
}