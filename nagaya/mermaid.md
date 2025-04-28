const errorTemplete = {
    part: "",
    index: 0,
    type: "",
    reason: "",
    suggestion: ""
};

 let GCR = {
        success:true,
        successes:[],
        currentType:[],
        currentTypeNum:0,
        currentIndex:0,
        flagsNum:0,
        temporaryWordsNum:0,
        message:"",
        errors:[],
    };


    const testGCR = {
    success:true,
    successes:[{S:[],V:[]}],
    currentType:["S","V"],
    currentTypeNum:0,
    message:"",
    errors:[],
}

GCR.currentType[GCR.currentTypeNum]（今のタイプ「S,V,O、C」）
GCR.flags.targetIndex（今の添え字）

tango[targetSentence[GCR.flags.targetIndex]].tags

GCR.flags.wordsCount += true_M_Num;
        GCR.flags.targetIndex += 1;

        let keyName = GCR.currentType[GCR.currentTypeNum] + "ZentiKeiyousi"
            GCR.errors.push({[keyName]:errorTemplete});
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = currentIndex;
            GCR.errors[keyName].type = "名詞修飾ミス！";
            GCR.errors[keyName].reason = "修飾のやり方が間違っています";
            GCR.errors[keyName].suggestion = "";