import { tango } from './wordData.js';

const DaimeisicanSArray = ['主格', '指示代名詞', '不定代名詞', '疑問代名詞'];
const DaimeisicanCArray = ['主格', '所有代名詞', '再帰代名詞', '指示代名詞', '不定代名詞', '疑問代名詞'];
const DaimeisicanOArray = ['目的格', '再帰代名詞', '指示代名詞', '不定代名詞', '疑問代名詞'];

let checkGrammerTestArray = {
    sentence: 1,
    s: ['many'],
    v: ['eat'],
};
/*
let a = {
    v: ['play', ['at', 'school']],
};

console.log(checkJidousiRoot(a.v));
*/

console.log(checkGrammer(checkGrammerTestArray));

export function checkGrammer(targetArray) {
    console.log('checkGrammer');
    console.log(targetArray);
    targetArray.sentence = targetArray.sentence.toString();

    let grammerTF = true;
    switch (targetArray.sentence) {
        case '1': //第一文型SV
            if (!checkS(targetArray.s)) {
                grammerTF = false;
            }
            if (!checkJidousiRoot(targetArray.v) && !checkBedousiRoot(targetArray.v)) {
                grammerTF = false;
            }
            break;
        case '2': //第二文型SVC
            if (!checkS(targetArray.s)) {
                grammerTF = false;
            }
            if (!checkRenketuRoot(targetArray.v) && !checkBedousiRoot(targetArray.v)) {
                grammerTF = false;
            }
            if (!checkC(targetArray.c)) {
                grammerTF = false;
            }
            break;
        case '3': //第三文型SVO
            if (!checkS(targetArray.s)) {
                grammerTF = false;
            }
            if (!checkTadousiRoot(targetArray.v)) {
                grammerTF = false;
            }
            if (!checkO(targetArray.o1)) {
                grammerTF = false;
            }
            break;
        case '4': //第四文型SVOO
            if (!checkS(targetArray.s)) {
                grammerTF = false;
            }
            if (!checkVOfSVOORoot(targetArray.v)) {
                grammerTF = false;
            }
            if (!checkO(targetArray.o1)) {
                grammerTF = false;
            }
            if (!checkO(targetArray.o2)) {
                grammerTF = false;
            }
            break;
        case '5': //第五文型SVOC
            if (!checkS(targetArray.s)) {
                grammerTF = false;
            }
            if (!checkVOfSVOCRoot(targetArray.v)) {
                grammerTF = false;
            }
            if (!checkO(targetArray.o1)) {
                grammerTF = false;
            }
            if (!checkC(targetArray.c)) {
                grammerTF = false;
            }
            break;
    }
    return grammerTF;
}

function checkGrammerPoint(targetArray) {
    //文法事項に則っているか
}

function checkS(targetSentence) /*＜S＞*/ {
    if (checkMeisiRoot(targetSentence) || checkDaimeisiCanS(targetSentence)) {
        return true;
    }
    return false;
}

function checkJidousiRoot(targetSentence) /*＜自動詞根＞*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    // targetIndex += checkTHJRoot(targetSentence, targetIndex);
    if (!tango[targetSentence[targetIndex]].tags.includes('自動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    // targetIndex += checkYBJRoot(targetSentence, targetIndex);
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkTadousiRoot(targetSentence) /*他動詞根*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    // targetIndex += checkTHJRoot(targetSentence, targetIndex);
    if (!tango[targetSentence[targetIndex]].tags.includes('他動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    // targetIndex += checkYBJRoot(targetSentence, targetIndex);
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkBedousiRoot(targetSentence) /*＜be動詞根＞*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    if (!tango[targetSentence[targetIndex]].tags.includes('be動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkRenketuRoot(targetSentence) /*＜連結動詞根*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    // targetIndex += checkTHJRoot(targetSentence, targetIndex);
    if (!tango[targetSentence[targetIndex]].tags.includes('連結動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    // targetIndex += checkYBJRoot(targetSentence, targetIndex);
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkVOfSVOORoot(targetSentence) /*＜SVOOがとれる動詞根＞*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    // targetIndex += checkTHJRoot(targetSentence, targetIndex);
    if (!tango[targetSentence[targetIndex]].tags.includes('SVOOがとれる動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    // targetIndex += checkYBJRoot(targetSentence, targetIndex);
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkVOfSVOCRoot(targetSentence) /*＜SVOCがとれる動詞根＞*/ {
    let targetIndex = checkJodousiRoot(targetSentence);
    // targetIndex += checkTHJRoot(targetSentence, targetIndex);
    if (!tango[targetSentence[targetIndex]].tags.includes('SVOCがとれる動詞')) {
        return false;
    } else {
        targetIndex += 1;
    }
    // targetIndex += checkYBJRoot(targetSentence, targetIndex);
    if (targetIndex == targetSentence.length) return true;
    return false;
}

function checkC(targetSentence) /*＜C＞*/ {
    if (
        checkMeisiRoot(targetSentence) ||
        checkDaimeisiCanC(targetSentence) ||
        (targetSentence.length == 1 && tango[targetSentence[0]].hinsi.includes('形容詞'))
    ) {
        return true;
    }
    return false;
}

function checkO(targetSentence) /*＜O＞*/ {
    if (checkMeisiRoot(targetSentence) || checkDaimeisiCanO(targetSentence)) {
        return true;
    }
    return false;
}

function checkMeisiRoot(targetSentence) /*＜名詞根＞*/ {
    let meisiIndex = targetSentence.length - 1;
    let targetIndex = checkKeiyousiRoot(targetSentence, checkKansiRoot(targetSentence));
    if (meisiIndex == targetIndex) return true;
    return false;
}

console.log(checkS(['I'])); // true
console.log(checkMeisiRoot(['I', 'am', 'a', 'apple', 'in', 'Tokyo'])); // false

function checkKansiRoot(targetSentence) /*＜冠詞根＞*/ {
    if (
        targetSentence.length > 0 &&
        (tango[targetSentence[0]].hinsi.includes('冠詞') ||
            tango[targetSentence[0]].tags.includes('所有格') ||
            tango[targetSentence[0]].tags.includes('指示代名詞'))
    ) {
        return 1;
    }
    return 0;
}

function checkKeiyousiRoot(targetSentence, targetIndex) /*＜形用詞根＞*/ {
    while (targetIndex < targetSentence.length && tango[targetSentence[targetIndex]].hinsi.includes('形容詞')) {
        targetIndex++;
    }
    return targetIndex;
}

function checkTHJRoot(targetSentence, targetIndex) /*＜程度頻度時間副詞根＞*/ {
    if (
        targetSentence.length > 0 &&
        (tango[targetSentence[targetIndex]].tags.includes('程度') ||
            tango[targetSentence[targetIndex]].tags.includes('頻度') ||
            targetSentence[targetIndex] == 'still' ||
            targetSentence[targetIndex] == 'already')
    ) {
        return 1;
    }
    return 0;
}

function checkYBJRoot(targetSentence, targetIndex) /*＜様態場所時間副詞根＞*/ {
    if (
        targetSentence.length > 0 &&
        targetIndex < targetSentence.length &&
        (tango[targetSentence[targetIndex]].tags.includes('様態') ||
            tango[targetSentence[targetIndex]].tags.includes('場所') ||
            tango[targetSentence[targetIndex]].tags.includes('時間'))
    ) {
        return 1;
    }
    return 0;
}

function checkJodousiRoot(targetSentence) /*＜助動詞根＞*/ {
    if (targetSentence.length > 1 && tango[targetSentence[0]].hinsi.includes('助動詞')) {
        return 1;
    }
    return 0;
}

function checkDaimeisiCanS(targetSentence) /*＜主語に使える代名詞＞*/ {
    if (targetSentence.length != 1) return false;
    return DaimeisicanSArray.some((value) => tango[targetSentence].tags.includes(value));
}

function checkDaimeisiCanC(targetSentence) /*＜補語に使える代名詞＞*/ {
    if (targetSentence.length != 1) return false;
    return DaimeisicanCArray.some((value) => tango[targetSentence].tags.includes(value));
}

function checkDaimeisiCanO(targetSentence) /*＜目的語に使える代名詞＞*/ {
    if (targetSentence.length != 1) return false;
    return DaimeisicanOArray.some((value) => tango[targetSentence].tags.includes(value));
}
