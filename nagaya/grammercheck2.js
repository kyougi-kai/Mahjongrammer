import { tango } from '../public/js/utils/wordData.js';

const errorTemplete = {
    part: '',
    index: 0,
    type: '',
    reason: '',
    suggestion: '',
};

const pointTemplete = {
    pointName: '',
    pointValue: 0,
};

let checkGrammerTestArray = {
    sentence: 3,
    s: ['he'],
    v: ['does', 'made'],
    o1: ['this', 'machine'],
};

const testGCR = {
    success: false,
    successes: { S: [], V: [] },
    currentType: ['S', 'V'],
    currentTypeNum: 0,
    currentIndex: 0,
    flagsNum: 100,
    temporaryWordsNum: 0,
    message: '',
    errors: {},
};

export function checkGrammer(targetArray) {
    targetArray.sentence = targetArray.sentence.toString();

    /**
     * @typedef {Object} gcr
     * @property {boolean} success -成功-
     */

    /** @type {gcr} 文法チェックの結果を代入（旧grammerCheckResult）*/
    let GCR = {
        success: true,
        successes: {},
        currentType: [],
        currentTypeNum: 0,
        currentIndex: 0,
        flagsNum: 100,
        temporaryWordsNum: 0,
        message: '',
        errors: {},
    };

    switch (targetArray.sentence) {
        case '1': //第一文型SV
            if ('m' in targetArray) {
                GCR.successes = { S: [], V: [], M: [] };
                GCR.currentType.push('S', 'V', 'M');
            } else {
                GCR.successes = { S: [], V: [] };
                GCR.currentType.push('S', 'V');
            }
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            if ('m' in targetArray) {
                checkM(targetArray.m, GCR, targetArray.sentence);
            }
            break;
        case '2': //第二文型SVC
            if ('m' in targetArray) {
                GCR.successes = { S: [], V: [], C: [], M: [] };
                GCR.currentType.push('S', 'V', 'C', 'M');
            } else {
                GCR.successes = { S: [], V: [], C: [] };
                GCR.currentType.push('S', 'V', 'C');
            }

            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkC(targetArray.c, GCR);
            GCR.currentTypeNum++;
            if ('m' in targetArray) {
                checkM(targetArray.m, GCR, targetArray.sentence);
            }
            break;
        case '3': //第三文型SVO
            if ('m' in targetArray) {
                GCR.successes = { S: [], V: [], O1: [], M: [] };
                GCR.currentType.push('S', 'V', 'O1', 'M');
            } else {
                GCR.successes = { S: [], V: [], O1: [] };
                GCR.currentType.push('S', 'V', 'O1');
            }

            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            if ('m' in targetArray) {
                checkM(targetArray.m, GCR, targetArray.sentence);
            }
            break;
        case '4': //第四文型SVOO
            if ('m' in targetArray) {
                GCR.successes = { S: [], V: [], O1: [], O2: [], M: [] };
                GCR.currentType.push('S', 'V', 'O1', 'O2', 'M');
            } else {
                GCR.successes = { S: [], V: [], O1: [], O2: [] };
                GCR.currentType.push('S', 'V', 'O1', 'O2');
            }

            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            checkO(targetArray.o2, GCR);
            GCR.currentTypeNum++;
            if ('m' in targetArray) {
                checkM(targetArray.m, GCR, targetArray.sentence);
            }
            break;
        case '5': //第五文型SVOC
            if ('m' in targetArray) {
                GCR.successes = { S: [], V: [], O1: [], C: [], M: [] };
                GCR.currentType.push('S', 'V', 'O1', 'C', 'M');
            } else {
                GCR.successes = { S: [], V: [], O1: [], C: [] };
                GCR.currentType.push('S', 'V', 'O1', 'C');
            }

            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            checkC(targetArray.c, GCR);
            GCR.currentTypeNum++;
            if ('m' in targetArray) {
                checkM(targetArray.m, GCR, targetArray.sentence);
            }
            break;
        default:
            GCR.message.push('存在しない文型を指定しています');
            break;
    }
    GCR = checkTotalGrammerMatters(GCR);
    const errorParts = ['S', 'V', 'O1', 'O2', 'C', 'M'];
    if (errorParts.some((part) => Object.values(GCR.errors).some((error) => error.part === part))) {
        GCR.success = false;
    }
    if (GCR.success == true) {
        GCR = exchangeToPoint(GCR, targetArray);
    }
    return GCR;
}

function exchangeToPoint(GCR, targetArray) {
    GCR.points = {};
    let keyName;
    let totalWordsCount = 0;

    switch (targetArray.sentence) {
        case '1': //第一文型SV
            totalWordsCount += GCR.allOfSTags.wordsCount;
            totalWordsCount += GCR.allOfVTags.wordsCount;
            if ('m' in targetArray) {
                totalWordsCount += GCR.allOfMTags.wordsCount;
            }
            keyName = '第一文型SV';
            GCR.points[keyName] = { ...pointTemplete };
            GCR.points[keyName].pointName = keyName;
            GCR.points[keyName].pointValue += 200;
            break;
        case '2': //第二文型SVC
            totalWordsCount += GCR.allOfSTags.wordsCount;
            totalWordsCount += GCR.allOfVTags.wordsCount;
            totalWordsCount += GCR.allOfCTags.wordsCount;
            keyName = '第二文型SVC';
            GCR.points[keyName] = { ...pointTemplete };
            GCR.points[keyName].pointName = keyName;
            GCR.points[keyName].pointValue += 300;
            break;
        case '3': //第三文型SVO
            totalWordsCount += GCR.allOfSTags.wordsCount;
            totalWordsCount += GCR.allOfVTags.wordsCount;
            totalWordsCount += GCR.allOfO1Tags.wordsCount;
            keyName = '第三文型SVO';
            GCR.points[keyName] = { ...pointTemplete };
            GCR.points[keyName].pointName = keyName;
            GCR.points[keyName].pointValue += 300;
            break;
        case '4': //第四文型SVOO
            totalWordsCount += GCR.allOfSTags.wordsCount;
            totalWordsCount += GCR.allOfVTags.wordsCount;
            totalWordsCount += GCR.allOfO1Tags.wordsCount;
            totalWordsCount += GCR.allOfO2Tags.wordsCount;
            keyName = '第四文型SVOO';
            GCR.points[keyName] = { ...pointTemplete };
            GCR.points[keyName].pointName = keyName;
            GCR.points[keyName].pointValue += 500;
            break;
        case '5': //第五文型SVOC
            totalWordsCount += GCR.allOfSTags.wordsCount;
            totalWordsCount += GCR.allOfVTags.wordsCount;
            totalWordsCount += GCR.allOfO1Tags.wordsCount;
            totalWordsCount += GCR.allOfCTags.wordsCount;
            keyName = '第五文型SVOC';
            GCR.points[keyName] = { ...pointTemplete };
            GCR.points[keyName].pointName = keyName;
            GCR.points[keyName].pointValue += 500;
            break;
        default:
            GCR.message.push('存在しない文型を指定しています');
            break;
    }
    GCR.wordsCount = totalWordsCount;
    keyName = '牌の個数';
    GCR.points[keyName] = { ...pointTemplete };
    GCR.points[keyName].pointName = keyName;
    GCR.points[keyName].pointValue += totalWordsCount * 100;
    GCR = pointManager(GCR);
    return GCR;
}

function checkS(targetSentence, GCR) /*＜S＞*/ {
    if (targetSentence.length == 1 && tango[targetSentence[0]].hinsi.includes('代名詞')) {
        GCR = checkDaimeisi(targetSentence, GCR);
    } else {
        GCR = checkMeisiRoot(targetSentence, GCR);
    }
    if (Object.values(GCR.errors).some((error) => error.part === 'S')) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
    return GCR;
}

function checkC(targetSentence, GCR) /*＜C＞*/ {
    if (targetSentence.length == 1 && tango[targetSentence[0]].hinsi.includes('代名詞')) {
        GCR = checkDaimeisi(targetSentence, GCR);
    } else if (targetSentence.flat(Infinity).some((value) => tango[value].hinsi.includes('名詞'))) {
        GCR = checkMeisiRoot(targetSentence, GCR);
    } else {
        GCR = checkKeiyousiRoot(targetSentence, GCR);
    }
    if (Object.values(GCR.errors).some((error) => error.part === 'C')) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
    return GCR;
}

function checkKeiyousiRoot(targetSentence, GCR) /*＜形容詞根＞*/ {
    let truenum = targetSentence.flat(Infinity).length;
    let keiyousiCount = 0;
    let targetIndex = 0;
    GCR['allOfCTags'] = { Ckeiyousi: [], wordsCount: 0, targetIndex: 0 };
    if (Array.isArray(targetSentence[targetIndex])) {
        keiyousiCount += checkHukusiOfCKeiyousi(targetSentence, GCR);
        targetIndex++;
    }
    if (tango[targetSentence[targetIndex]].hinsi.includes('形容詞')) keiyousiCount++;
    if (truenum == keiyousiCount) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('true');
    } else {
        GCR = errorManager(GCR, '', 'HogoMissOfAny'); //補語のどこかにミスがある
    }
    GCR['allOfCTags'].Ckeiyousi.push(tango[targetSentence[GCR['allOfCTags'].targetIndex]].tags); //タグを代入
    GCR['allOfCTags'].Ckeiyousi = GCR['allOfCTags'].Ckeiyousi.flat(Infinity);
    GCR['allOfCTags'].wordsCount += 1;
    return GCR;
}

function checkHukusiOfCKeiyousi(targetSentence, GCR) {
    let hukusiCount = 0;
    while (
        hukusiCount < targetSentence[0].length &&
        tango[targetSentence[0][hukusiCount]].hinsi.includes('副詞') &&
        (tango[targetSentence[0][hukusiCount]].tags.includes('程度') ||
            tango[targetSentence[0][hukusiCount]].tags.includes('強調') ||
            tango[targetSentence[0][hukusiCount]].tags.includes('様態') ||
            tango[targetSentence[0][hukusiCount]].tags.includes('否定'))
    ) {
        hukusiCount++;
    }
    return hukusiCount;
}

function checkO(targetSentence, GCR) /*＜O＞*/ {
    if (targetSentence.length == 1 && tango[targetSentence[0]].hinsi.includes('代名詞')) {
        GCR = checkDaimeisi(targetSentence, GCR);
    } else {
        GCR = checkMeisiRoot(targetSentence, GCR);
    }
    if (Object.values(GCR.errors).some((error) => error.part === 'O1')) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
    if (Object.values(GCR.errors).some((error) => error.part === 'O2')) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
    return GCR;
}

function checkMeisiRoot(targetSentence, GCR) /*＜名詞根＞*/ {
    GCR[GCR.flagsNum] = { kansi: [], zentiKeiyousi: [], meisi: [], koutiKeiyousi: [], wordsCount: 0, targetIndex: 0 };
    console.log('フラットなGCR', targetSentence, GCR);
    let truenum = targetSentence.flat(Infinity).length;
    console.log('truenum', truenum);
    if (truenum == 0) {
        GCR = errorManager(GCR, '名詞', 'AllNotExist'); /*何も入っていない場合*/
        return GCR;
    }
    if (targetSentence.length > GCR[GCR.flagsNum].targetIndex) GCR = checkKansiRoot(targetSentence, GCR);
    if (targetSentence.length > GCR[GCR.flagsNum].targetIndex) GCR = checkZentiKeiyousiRoot(targetSentence, GCR);
    if (targetSentence.length > GCR[GCR.flagsNum].targetIndex) {
        GCR = checkMeisi(targetSentence, GCR);
    } else {
        GCR[GCR.flagsNum].meisi.push('false');
    }
    console.log('checkKoutiKeiyousiRoot前', targetSentence.length, GCR[GCR.flagsNum].targetIndex);
    if (targetSentence.length > GCR[GCR.flagsNum].targetIndex) GCR = checkKoutiKeiyousiRoot(targetSentence, GCR);
    if (truenum == GCR[GCR.flagsNum].wordsCount) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('true');
    } else {
        GCR = errorManager(GCR, '', 'MeisiMissOfAny'); //名詞のどこかにミスがある
    }
    console.log('checkMeisiRoot通過後GCR', targetSentence, GCR);
    GCR = checkMeisiGrammerMatters(targetSentence, GCR); //三単現s、単数形/複数形の処理を入れる
    GCR.temporaryWordsNum = GCR[GCR.flagsNum].wordsCount;
    GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'] = GCR[GCR.flagsNum];
    delete GCR[GCR.flagsNum];
    return GCR;
}

function checkKansiRoot(targetSentence, GCR) {
    if (Array.isArray(targetSentence[0])) return GCR;
    if (
        targetSentence.length > 0 &&
        (tango[targetSentence[0]].hinsi.includes('冠詞') ||
            tango[targetSentence[0]].tags.includes('所有格') ||
            tango[targetSentence[0]].tags.includes('指示代名詞') ||
            tango[targetSentence[0]].tags.includes('数詞'))
    ) {
        GCR[GCR.flagsNum].wordsCount += 1;
        GCR[GCR.flagsNum].targetIndex += 1;
        GCR.currentIndex += 1;
        GCR[GCR.flagsNum].kansi.push(tango[targetSentence[0]].tags);
        GCR[GCR.flagsNum].kansi = GCR[GCR.flagsNum].kansi.flat(Infinity);
    } else {
        GCR[GCR.flagsNum].kansi.push('false');
    }
    console.log('checkKansiroot通過後GCR', targetSentence, GCR);
    return GCR;
}

function checkZentiKeiyousiRoot(targetSentence, GCR) {
    if (Array.isArray(targetSentence[GCR[GCR.flagsNum].targetIndex])) {
        let true_M_Num = targetSentence[GCR[GCR.flagsNum].targetIndex].length;
        let keiyousiCount = 0;

        if (
            tango[targetSentence[GCR[GCR.flagsNum].targetIndex][keiyousiCount]].tags.includes('過去分詞') ||
            tango[targetSentence[GCR[GCR.flagsNum].targetIndex][keiyousiCount]].tags.includes('現在分詞')
        ) {
            keiyousiCount += 1;
        } else {
            keiyousiCount += checkHukusiOfKeiyousi(targetSentence, GCR); //形容詞の前に副詞があるかどうか
            while (
                keiyousiCount < targetSentence[GCR[GCR.flagsNum].targetIndex].length &&
                tango[targetSentence[GCR[GCR.flagsNum].targetIndex][keiyousiCount]].hinsi.includes('形容詞')
            ) {
                keiyousiCount++;
            }
        }

        if (true_M_Num != keiyousiCount) {
            GCR = errorManager(GCR, '', 'ZentiKeiyousi');
        }
        GCR[GCR.flagsNum].wordsCount += keiyousiCount;
        GCR.currentIndex += keiyousiCount;
        GCR[GCR.flagsNum].targetIndex += 1;
    }
    console.log('checkZentiKeiyousiroot通過後GCR', targetSentence, GCR);
    return GCR;
}

function checkMeisi(targetSentence, GCR) {
    if (Array.isArray(targetSentence[GCR[GCR.flagsNum].targetIndex])) {
        GCR = errorManager(GCR, '', 'MeisiNotExist');
    }
    if (tango[targetSentence[GCR[GCR.flagsNum].targetIndex]].hinsi.includes('名詞')) {
        GCR[GCR.flagsNum].meisi.push(tango[targetSentence[GCR[GCR.flagsNum].targetIndex]].tags); //タグを代入ここから
        GCR[GCR.flagsNum].meisi = GCR[GCR.flagsNum].meisi.flat(Infinity);
        GCR[GCR.flagsNum].wordsCount += 1;
        GCR[GCR.flagsNum].targetIndex += 1;
        GCR.currentIndex += 1;
    } else {
        GCR[GCR.flagsNum].targetIndex += 1;
        GCR = errorManager(GCR, '', 'MeisiNotExist'); //名詞が存在しない
    }
    console.log('checkMeisi通過後GCR', targetSentence, GCR);
    return GCR;
}

function checkKoutiKeiyousiRoot(targetSentence, GCR) {
    if (Array.isArray(targetSentence[GCR[GCR.flagsNum].targetIndex])) {
        let true_M_Num = targetSentence[GCR[GCR.flagsNum].targetIndex].length;
        let keiyousiCount = 0;

        if (tango[targetSentence[GCR[GCR.flagsNum].targetIndex][keiyousiCount]].hinsi.includes('前置詞')) {
            let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence[GCR[GCR.flagsNum].targetIndex])); // ディープコピー
            GCR.flagsNum = GCR.flagsNum + 1;
            temporaryTargetSentence.shift();
            let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
            temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
            if (temporaryGCR.temporaryWordsNum > 0) keiyousiCount = temporaryGCR.temporaryWordsNum + 1; //名詞がある場合
            GCR.errors = temporaryGCR.errors;
            GCR.flagsNum = GCR.flagsNum - 1;
        }

        if (true_M_Num != keiyousiCount) {
            GCR = errorManager(GCR, '', 'KoutiKeiyousi');
        }
        GCR[GCR.flagsNum].wordsCount += keiyousiCount;
        GCR.currentIndex += keiyousiCount;
        GCR[GCR.flagsNum].targetIndex += 1;
    }
    console.log('checkKoutiKeiyousiroot通過後GCR', targetSentence, GCR);
    return GCR;
}

function checkDaimeisi(targetSentence, GCR) /*＜代名詞根＞*/ {
    let DaimeisiTypeArray;
    let typeText = '';
    GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'] = { daimeisi: [], wordsCount: 0, targetIndex: 0 };
    switch (GCR.currentType[GCR.currentTypeNum]) {
        case 'S':
            DaimeisiTypeArray = ['主格', '指示代名詞', '不定代名詞', '疑問代名詞'];
            typeText = '主語';
            break;
        case 'C':
            DaimeisiTypeArray = ['主格', '所有代名詞', '再帰代名詞', '指示代名詞', '不定代名詞', '疑問代名詞'];
            typeText = '補語';
            break;
        case 'O1':
            DaimeisiTypeArray = ['目的格', '再帰代名詞', '指示代名詞', '不定代名詞', '疑問代名詞'];
            typeText = '目的語';
            break;
        case 'O2':
            DaimeisiTypeArray = ['目的格', '再帰代名詞', '指示代名詞', '不定代名詞', '疑問代名詞'];
            typeText = '目的語';
            break;
        default:
            DaimeisiTypeArray = [];
            break;
    }
    if ((targetSentence.length = 1 && tango[targetSentence[0]].hinsi.includes('代名詞'))) {
        if (DaimeisiTypeArray.some((value) => tango[targetSentence].tags.includes(value))) {
            GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('true');
        } else {
            GCR = errorManager(GCR, GCR.currentType[GCR.currentTypeNum], 'Daimeisi');
        }
    }
    GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'].daimeisi.push(
        tango[targetSentence[GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'].targetIndex]].tags
    ); //タグを代入
    GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'].daimeisi =
        GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'].daimeisi.flat(Infinity);
    GCR['allOf' + GCR.currentType[GCR.currentTypeNum] + 'Tags'].wordsCount += 1;
    return GCR;
}

function checkMeisiGrammerMatters(targetSentence, GCR) {
    console.log('checkMeisiGrammerMatters', targetSentence, GCR);
    if (GCR[GCR.flagsNum].kansi.length > 0 && !GCR[GCR.flagsNum].kansi.includes('false') && GCR[GCR.flagsNum].meisi.includes('false')) {
        /*名詞が入っていない場合*/ GCR = errorManager(GCR, '', 'MeisiNotExist');
    }
    if (GCR[GCR.flagsNum].kansi.includes('false') && GCR[GCR.flagsNum].meisi.includes('可算名詞') && GCR[GCR.flagsNum].meisi.includes('単数形')) {
        /*冠詞が空で名詞が可算名詞の場合*/ GCR = errorManager(GCR, '', 'KansiNotExist');
    }
    if (GCR[GCR.flagsNum].meisi.includes('不可算名詞') && GCR[GCR.flagsNum].kansi.includes('不定冠詞')) {
        /*不可算名詞に不定冠詞をつけている場合*/ GCR = errorManager(GCR, '', 'KansiMissOfHuteiOnHukasan');
    }
    if (GCR[GCR.flagsNum].meisi.includes('可算名詞') && GCR[GCR.flagsNum].meisi.includes('複数形') && GCR[GCR.flagsNum].kansi.includes('不定冠詞')) {
        /*複数形の名詞に不定冠詞をつけている場合*/ GCR = errorManager(GCR, '', 'KansiMissOfHuteiOnHukusuu');
    }
    if (GCR[GCR.flagsNum].meisi.includes('可算名詞') && GCR[GCR.flagsNum].meisi.includes('単数形') && GCR[GCR.flagsNum].kansi.includes('数詞')) {
        /*単数形の名詞に数詞をつけている場合*/ GCR = errorManager(GCR, '', 'KansiMissOfSuusiOnTansuu');
    }
    if (
        GCR[GCR.flagsNum].meisi.includes('可算名詞') &&
        GCR[GCR.flagsNum].meisi.includes('単数形') &&
        GCR[GCR.flagsNum].meisi.includes('母音で始まる') &&
        GCR[GCR.flagsNum].kansi.includes('直後子音')
    ) {
        /*発音が母音で始まる単語にaをつけている場合*/ GCR = errorManager(GCR, '', 'KansiMissOfaOnBoin');
    }
    if (
        GCR[GCR.flagsNum].meisi.includes('可算名詞') &&
        GCR[GCR.flagsNum].meisi.includes('単数形') &&
        GCR[GCR.flagsNum].meisi.includes('子音で始まる') &&
        GCR[GCR.flagsNum].kansi.includes('直後母音')
    ) {
        /*発音が子音で始まる単語にanをつけている場合*/ GCR = errorManager(GCR, '', 'KansiMissOfanOnShiin');
    }
    return GCR;
}

function checkM(targetSentence, GCR, sentenceType) {
    let wordsCount = 0;
    GCR['allOfMTags'] = {};
    console.log('checkM開始時点のGCR', targetSentence, GCR);
    let truenum = targetSentence.flat(Infinity).length;
    if (truenum == 0) {
        GCR = errorManager(GCR, '修飾語', 'AllNotExist'); /*何も入っていない場合*/
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
        return GCR;
    }

    switch (sentenceType) {
        case '1': //第一文型SV
            if (tango[targetSentence[0]].hinsi.includes('前置詞')) {
                wordsCount += 1;
                let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence)); // ディープコピー
                temporaryTargetSentence.shift();
                let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
                temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
                if (temporaryGCR.temporaryWordsNum > 0) wordsCount += temporaryGCR.temporaryWordsNum; //名詞がある場合
                console.log('temporaryGCRRRRRRRRRRR', temporaryGCR);
                GCR['allOfMTags'] = temporaryGCR['allOfMTags'];
                GCR['allOfMTags'].wordsCount = wordsCount;
                GCR.errors = temporaryGCR.errors;
            }
            break;
        case '2': //第二文型SVC
            if (tango[targetSentence[0]].hinsi.includes('前置詞')) {
                wordsCount += 1;
                let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence)); // ディープコピー
                temporaryTargetSentence.shift();
                let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
                temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
                if (temporaryGCR.temporaryWordsNum > 0) wordsCount += temporaryGCR.temporaryWordsNum; //名詞がある場合
                console.log('temporaryGCRRRRRRRRRRR', temporaryGCR);
                GCR['allOfMTags'] = temporaryGCR['allOfMTags'];
                GCR['allOfMTags'].wordsCount = wordsCount;
                GCR.errors = temporaryGCR.errors;
            }
            break;
        case '3': //第三文型SVO
            if (tango[targetSentence[0]].hinsi.includes('前置詞')) {
                wordsCount += 1;
                let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence)); // ディープコピー
                temporaryTargetSentence.shift();
                let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
                temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
                if (temporaryGCR.temporaryWordsNum > 0) wordsCount += temporaryGCR.temporaryWordsNum; //名詞がある場合
                console.log('temporaryGCRRRRRRRRRRR', temporaryGCR);
                GCR['allOfMTags'] = temporaryGCR['allOfMTags'];
                GCR['allOfMTags'].wordsCount = wordsCount;
                GCR.errors = temporaryGCR.errors;
            }
            break;
        case '4': //第四文型SVOO
            if (tango[targetSentence[0]].hinsi.includes('前置詞')) {
                wordsCount += 1;
                let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence)); // ディープコピー
                temporaryTargetSentence.shift();
                let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
                temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
                if (temporaryGCR.temporaryWordsNum > 0) wordsCount += temporaryGCR.temporaryWordsNum; //名詞がある場合
                console.log('temporaryGCRRRRRRRRRRR', temporaryGCR);
                GCR['allOfMTags'] = temporaryGCR['allOfMTags'];
                GCR['allOfMTags'].wordsCount = wordsCount;
                GCR.errors = temporaryGCR.errors;
            }
            break;
        case '5': //第五文型SVOC
            if (tango[targetSentence[0]].hinsi.includes('前置詞')) {
                wordsCount += 1;
                let temporaryTargetSentence = JSON.parse(JSON.stringify(targetSentence)); // ディープコピー
                temporaryTargetSentence.shift();
                let temporaryGCR = JSON.parse(JSON.stringify(GCR)); // GCRをディープコピー
                temporaryGCR = checkMeisiRoot(temporaryTargetSentence, temporaryGCR); //仮のGCRを引数にする。本当のGCRは渡さない←何で？いみわからん←trueが2個返ってくるから
                if (temporaryGCR.temporaryWordsNum > 0) wordsCount += temporaryGCR.temporaryWordsNum; //名詞がある場合
                console.log('temporaryGCRRRRRRRRRRR', temporaryGCR);
                GCR['allOfMTags'] = temporaryGCR['allOfMTags'];
                GCR['allOfMTags'].wordsCount = wordsCount;
                GCR.errors = temporaryGCR.errors;
            }
            break;
        default:
            GCR.message.push('存在しない文型を指定しています');
            break;
    }

    if (truenum == GCR['allOfMTags'].wordsCount) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('true');
    } else {
        console.log('checkMRoot通過後GCR', targetSentence, GCR);
        GCR = errorManager(GCR, '', 'MMissOfAny'); //修飾語のどこかにミスがある
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
    if (Object.values(GCR.errors).some((error) => error.part === 'M')) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('false');
    }
}

//console.log('checkV結果：', checkGrammerTestArray.v, checkV(checkGrammerTestArray.v, testGCR, checkGrammerTestArray.sentence));

function checkV(targetSentence, GCR, sentenceType) /*＜V＞*/ {
    let temporaryIndex = targetSentence.length - 1;
    GCR['allOfVTags'] = { houjodousi: [], jodousi: [], zentiHukusi: [], dousi: [], koutiHukusi: [], wordsCount: 0, targetIndex: temporaryIndex };
    console.log('checkV開始時点のGCR', targetSentence, GCR);
    let truenum = targetSentence.flat(Infinity).length;
    if (truenum == 0) {
        GCR = errorManager(GCR, '動詞', 'AllNotExist'); /*何も入っていない場合*/
        return GCR;
    }

    if (GCR['allOfVTags'].targetIndex >= 0) GCR = checkDousi(targetSentence, GCR, sentenceType); //動詞が存在するかどうか
    console.log('checkDousiRoot通過後GCR', targetSentence, GCR);
    if (GCR['allOfVTags'].targetIndex >= 0) GCR = checkJodousiRoot(targetSentence, GCR, sentenceType); //助動詞が存在するかどうか

    if (truenum == GCR['allOfVTags'].wordsCount) {
        GCR.successes[GCR.currentType[GCR.currentTypeNum]].push('true');
    } else {
        console.log('checkDousiRoot通過後GCR', targetSentence, GCR);
        GCR = errorManager(GCR, '', 'DousiMissOfAny'); //動詞のどこかにミスがある
    }
    return GCR;
}

function checkDousi(targetSentence, GCR, sentenceType) {
    if (Array.isArray(targetSentence[GCR['allOfVTags'].targetIndex])) {
        GCR = errorManager(GCR, '', 'DousiNotExist');
        console.log('checkDousi通過後GCR', targetSentence, GCR);
    }
    switch (sentenceType) {
        case '1': //第一文型SV
            if (
                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('自動詞') ||
                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞')
            ) {
                GCR['allOfVTags'].dousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                GCR['allOfVTags'].dousi = GCR['allOfVTags'].dousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
            } else {
                GCR = errorManager(GCR, '', 'DousiMissOfBunkei1'); //第一文型ミス！
            }
            break;
        case '2': //第二文型SVC
            if (
                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('連結動詞') ||
                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞')
            ) {
                GCR['allOfVTags'].dousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                GCR['allOfVTags'].dousi = GCR['allOfVTags'].dousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
            } else {
                GCR = errorManager(GCR, '', 'DousiMissOfBunkei2'); //第二文型ミス！
            }
            break;
        case '3': //第三文型SVO
            if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('他動詞')) {
                GCR['allOfVTags'].dousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                GCR['allOfVTags'].dousi = GCR['allOfVTags'].dousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
            } else {
                GCR = errorManager(GCR, '', 'DousiMissOfBunkei3'); //第三文型ミス！
            }
            break;
        case '4': //第四文型SVOO
            if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('SVOOがとれる動詞')) {
                GCR['allOfVTags'].dousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                GCR['allOfVTags'].dousi = GCR['allOfVTags'].dousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
            } else {
                GCR = errorManager(GCR, '', 'DousiMissOfBunkei4'); //第四文型ミス！
            }
            break;
        case '5': //第五文型SVOC
            if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('SVOCがとれる動詞')) {
                GCR['allOfVTags'].dousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                GCR['allOfVTags'].dousi = GCR['allOfVTags'].dousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
            } else {
                GCR = errorManager(GCR, '', 'DousiMissOfBunkei5'); //第五文型ミス！
            }
            break;
    }
    GCR['allOfVTags'].targetIndex -= 1;
    return GCR;
}

function checkJodousiRoot(targetSentence, GCR) {
    if (Array.isArray(targetSentence[GCR['allOfVTags'].targetIndex])) {
        GCR = errorManager(GCR, '', 'JodousiIsDifferent');
        console.log('checkDousi通過後GCR', targetSentence, GCR);
        return GCR;
    }
    //相助動詞があるかどうか
    if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('相助動詞')) {
        GCR['allOfVTags'].jodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags);
        GCR['allOfVTags'].jodousi = GCR['allOfVTags'].jodousi.flat(Infinity);
        GCR['allOfVTags'].wordsCount += 1;
        GCR['allOfVTags'].targetIndex -= 1;
    } else if (targetSentence[GCR['allOfVTags'].targetIndex] == 'been') {
        if (GCR['allOfVTags'].targetIndex - 1 >= 0) {
            if (tango[targetSentence[GCR['allOfVTags'].targetIndex - 1]].tags.includes('have')) {
                GCR['allOfVTags'].jodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags);
                GCR['allOfVTags'].jodousi = GCR['allOfVTags'].jodousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
                GCR['allOfVTags'].targetIndex -= 1;
                GCR['allOfVTags'].jodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags);
                GCR['allOfVTags'].jodousi = GCR['allOfVTags'].jodousi.flat(Infinity);
                GCR['allOfVTags'].wordsCount += 1;
                GCR['allOfVTags'].targetIndex -= 1;
            }
        }
    } else {
        GCR['allOfVTags'].jodousi.push('false');
    }
    //法助動詞の次に法助動詞が続いたらエラー、そのほかの助動詞はOK
    if (GCR['allOfVTags'].targetIndex >= 0) {
        if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('法助動詞')) {
            //法助動詞が存在する場合
            GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
            GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
            if (targetSentence[GCR['allOfVTags'].targetIndex] == 'will') GCR['allOfVTags'].houjodousi.push('未来'); //タグを代入
            GCR['allOfVTags'].wordsCount += 1;
            GCR['allOfVTags'].targetIndex -= 1;
        } else if (targetSentence[GCR['allOfVTags'].targetIndex] == 'to' && GCR['allOfVTags'].jodousi.includes('false')) {
            //疑似法助動詞がある場合
            GCR['allOfVTags'].wordsCount += 1;
            GCR['allOfVTags'].targetIndex -= 1;
            if (GCR['allOfVTags'].targetIndex >= 0) {
                switch (targetSentence[GCR['allOfVTags'].targetIndex]) {
                    case 'going': //be going toの時
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        if (GCR['allOfVTags'].targetIndex >= 0) {
                            if (
                                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞') &&
                                !tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('過去分詞') &&
                                !tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('現在分詞')
                            ) {
                                GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                                GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                                GCR['allOfVTags'].houjodousi.push('疑似法助動詞', 'be', '未来'); //タグを代入
                                GCR['allOfVTags'].wordsCount += 1;
                                GCR['allOfVTags'].targetIndex -= 1;
                            } else if (
                                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞') &&
                                (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('過去分詞') ||
                                    tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('現在分詞'))
                            ) {
                                /**be going to でbeen やbeing を使っている場合 */ errorManager(GCR, 'be going to', 'gijijodousiMiss');
                            }
                        }
                        break;
                    case 'able': //be able toの時
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        if (GCR['allOfVTags'].targetIndex >= 0) {
                            if (
                                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞') &&
                                !tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('過去分詞') &&
                                !tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('現在分詞')
                            ) {
                                GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                                GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                                GCR['allOfVTags'].houjodousi.push('疑似法助動詞', 'be', 'beableto'); //タグを代入
                                GCR['allOfVTags'].wordsCount += 1;
                                GCR['allOfVTags'].targetIndex -= 1;
                            } else if (
                                tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('be動詞') &&
                                (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('過去分詞') ||
                                    tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('現在分詞'))
                            ) {
                                /**be able to でbeen やbeing を使っている場合 */ errorManager(GCR, 'be able to', 'gijijodousiMiss');
                            }
                        }
                        break;
                    case 'have': //have to
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                        GCR['allOfVTags'].houjodousi.push('疑似法助動詞', 'have'); //タグを代入
                        break;
                    case 'has': //has to
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                        GCR['allOfVTags'].houjodousi.push('疑似法助動詞'); //タグを代入
                        break;
                    case 'had': //had to
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                        GCR['allOfVTags'].houjodousi.push('疑似法助動詞'); //タグを代入
                        break;
                    case 'used': //used to
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                        GCR['allOfVTags'].houjodousi.push('疑似法助動詞'); //タグを代入
                        break;
                    case 'ought': //ought to
                        GCR['allOfVTags'].wordsCount += 1;
                        GCR['allOfVTags'].targetIndex -= 1;
                        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
                        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
                        GCR['allOfVTags'].houjodousi.push('疑似法助動詞'); //タグを代入
                        break;
                    default:
                        break;
                }
            }
        } else if (targetSentence[GCR['allOfVTags'].targetIndex] == 'better' && GCR['allOfVTags'].jodousi.includes('false')) {
            //had better
            GCR['allOfVTags'].wordsCount += 1;
            GCR['allOfVTags'].targetIndex -= 1;
        } else {
            GCR['allOfVTags'].houjodousi.push('false'); //タグを代入
        }
    }
    return GCR;
}

function errorManager(GCR, typeText, errorID) {
    let keyName;
    switch (errorID) {
        case 'AllNotExist': //何も入っていない
            keyName = GCR.currentType[GCR.currentTypeNum] + 'All';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = typeText + 'ミス！';
            GCR.errors[keyName].reason = '何も入っていません';
            GCR.errors[keyName].suggestion = '何か入れましょう';
            break;
        case 'KansiNotExist': //冠詞が存在しない
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '可算名詞には冠詞が必要です';
            GCR.errors[keyName].suggestion = '冠詞を入れましょう';
            break;
        case 'KansiMissOfHuteiOnHukasan': //不可算名詞に不定冠詞をつけている
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '不可算名詞には不定冠詞はつけられません';
            GCR.errors[keyName].suggestion = '冠詞を変えるか、名詞を変えましょう';
            break;
        case 'KansiMissOfHuteiOnHukusuu': //複数形の名詞に不定冠詞をつけている
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '複数形の名詞に不定冠詞はつけられません';
            GCR.errors[keyName].suggestion = '冠詞を変えるか、名詞を変えましょう';
            break;
        case 'KansiMissOfSuusiOnTansuu': //単数形の名詞に数詞をつけている
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '単数形の名詞に数詞はつけられません';
            GCR.errors[keyName].suggestion = '冠詞を変えるか、名詞を変えましょう';
            break;
        case 'KansiMissOfaOnBoin': //発音が母音で始まる単語にaをつけている
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '発音が母音で始まる単語にaはつけられません';
            GCR.errors[keyName].suggestion = '冠詞を変えるか、名詞を変えましょう';
            break;
        case 'KansiMissOfanOnShiin': //発音が子音で始まる単語にanをつけている
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Kansi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '冠詞ミス！';
            GCR.errors[keyName].reason = '発音が子音で始まる単語にanはつけられません';
            GCR.errors[keyName].suggestion = '冠詞を変えるか、名詞を変えましょう';
            break;
        case 'ZentiKeiyousi': //前置修飾ミス
            keyName = GCR.currentType[GCR.currentTypeNum] + 'ZentiKeiyousi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '名詞修飾ミス！';
            GCR.errors[keyName].reason = '修飾のやり方が間違っています';
            GCR.errors[keyName].suggestion = '';
            break;
        case 'MeisiNotExist': //名詞が存在しない
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Meisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '名詞ミス！';
            GCR.errors[keyName].reason = '名詞が存在しません';
            GCR.errors[keyName].suggestion = '名詞を入れましょう';
            break;
        case 'KoutiKeiyousi': //後置修飾ミス
            keyName = GCR.currentType[GCR.currentTypeNum] + 'KoutiKeiyousi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '名詞修飾ミス！';
            GCR.errors[keyName].reason = '後置修飾のやり方が間違っています';
            GCR.errors[keyName].suggestion = '';
            break;
        case 'Daimeisi': //代名詞ミス
            keyName = GCR.currentType[GCR.currentTypeNum] + 'Daimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '代名詞ミス！';
            GCR.errors[keyName].reason = typeText + 'に使えない代名詞が入っています';
            GCR.errors[keyName].suggestion = '別の代名詞に変えてみましょう';
            break;
        case 'MeisiMissOfAny': //名詞のどこかにミスがある
            keyName = GCR.currentType[GCR.currentTypeNum] + 'MeisiAny';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '名詞ミス！';
            GCR.errors[keyName].reason = '名詞のどこかにミスがあります';
            GCR.errors[keyName].suggestion = 'ミスがある箇所を確認してみましょう';
            break;
        case 'HogoMissOfAny': //補語のどこかにミスがある
            keyName = GCR.currentType[GCR.currentTypeNum] + 'HogoAny';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '補語ミス！';
            GCR.errors[keyName].reason = '補語のどこかにミスがあります';
            GCR.errors[keyName].suggestion = 'ミスがある箇所を確認してみましょう';
            break;
        case 'DousiNotExist': //動詞が存在しない
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiNotExist';
            console.log(keyName);
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '動詞が存在しません';
            GCR.errors[keyName].suggestion = '動詞を入れましょう';
            break;
        case 'DousiMissOfAny': //動詞のどこかにミスがある
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfAny';
            console.log(keyName);
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '動詞のどこかにミスがあります';
            GCR.errors[keyName].suggestion = 'ミスがある箇所を確認してみましょう';
            break;
        case 'DousiMissOfBunkei1': //第一文型ミス！
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfBunkei1';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '第一文型SVでは自動詞かbe動詞が必要です';
            GCR.errors[keyName].suggestion = '動詞を変えてみましょう';
            break;
        case 'DousiMissOfBunkei2': //第二文型ミス！
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfBunkei2';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '第二文型SVCではbe動詞か連結動詞が必要です';
            GCR.errors[keyName].suggestion = '動詞を変えてみましょう';
            break;
        case 'DousiMissOfBunkei3': //第三文型ミス！
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfBunkei3';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '第三文型SVOでは他動詞が必要です';
            GCR.errors[keyName].suggestion = '動詞を変えてみましょう';
            break;
        case 'DousiMissOfBunkei4': //第四文型ミス！
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfBunkei4';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '第四文型SVOOではSVOOがとれる動詞が必要です';
            GCR.errors[keyName].suggestion = '動詞を変えてみましょう';
            break;
        case 'DousiMissOfBunkei5': //第五文型ミス！
            keyName = GCR.currentType[GCR.currentTypeNum] + 'DousiMissOfBunkei5';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '動詞ミス！';
            GCR.errors[keyName].reason = '第五文型SVOCではSVOCがとれる動詞が必要です';
            GCR.errors[keyName].suggestion = '動詞を変えてみましょう';
            break;
        case 'JodousiIsDifferent': //助動詞が違う
            keyName = GCR.currentType[GCR.currentTypeNum] + 'JodousiIsDifferent';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = 'Vの中にMを入れているかもしれません';
            GCR.errors[keyName].suggestion = '助動詞を入れ直してみましょう';
            break;
        case 'MMissOfAny':
            keyName = GCR.currentType[GCR.currentTypeNum] + 'MMissOfAny';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = GCR.currentType[GCR.currentTypeNum];
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '修飾語ミス！';
            GCR.errors[keyName].reason = 'Mの中身にミスがあります';
            GCR.errors[keyName].suggestion = '前置詞が抜けているかもしれません。ミスのある箇所を確認してみましょう';
            break;
        case 'SantangensMissbyIyouwe':
            keyName = 'SantangensMissbyIyouwe';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = '動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = 'I,youや複数を表す代名詞には三単現sは使えません。活用形を変えてみましょう';
            break;
        case 'SantangensMissbygenkei':
            keyName = 'SantangensMissbygenkei';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = '動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = '助動詞がない時は、I,you以外の主語には原型は使えません。活用形を変えてみましょう';
            break;
        case 'SantangensMissbyhukusuu':
            keyName = 'SantangensMissbyhukusuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = '動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = '複数形の名詞には、三単現sは使えません。活用形を変えてみましょう';
            break;
        case 'bedousiMissbyitininsyodaimeisi':
            keyName = 'bedousiMissbyitininsyodaimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = 'be動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = 'Iにはam,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bedousiMissbynininnsyodaimeisi':
            keyName = 'bedousiMissbyI';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = 'be動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion =
                'youまたは複数形の代名詞にはare,were,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bedousiMissbysanninsyodaimeisi':
            keyName = 'bedousiMissbysanninsyodaimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = 'be動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = '三人称単数の代名詞にはis,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bedousiMissbyTansuu':
            keyName = 'bedousiMissbyTansuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = 'be動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = '単数形の名詞にはis,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bedousiMissbyhukusuu':
            keyName = 'bedousiMissbyhukusuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = 'be動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = '複数形の名詞にはare,were,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'JodousiMissbynotgenkei':
            keyName = 'JodousiMissbynotgenkei';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '文法ミス！';
            GCR.errors[keyName].reason = '助動詞の使い方を間違えています';
            GCR.errors[keyName].suggestion = 'can,willなどの助動詞をつける場合には，原型の動詞をつけましょう';
            break;
        case 'gijijodousiMiss':
            keyName = 'gijijodousiMiss';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion = typeText + 'を作る際には，beenやbeingは使えません。他のbe動詞に変えてみましょう';
            break;
        case 'havetoMissbyIyouwe':
            keyName = 'havetoMissbyIyouwe';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion = 'have toを作る際にも，I,youや複数を表す代名詞には三単現sは使えません。hasをhaveなどに変えてみましょう';
            break;
        case 'havetoMissbygenkei':
            keyName = 'havetoMissbygenkei';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion = 'have toを作る際にも，三人称単数現在形の主語には原型は使えません。原型でない活用形に変えてみましょう';
            break;
        case 'havetoMissbyhukusuu':
            keyName = 'havetoMissbyhukusuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion = 'have toを作る際にも，複数形の名詞には、三単現sは使えません。活用形を変えてみましょう';
            break;
        case 'bejodousiMissbyitininsyodaimeisi':
            keyName = 'bejodousiMissbyitininsyodaimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion =
                'be going to,be able toを作る際にも，Iにはam,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bejodousiMissbynininnsyodaimeisi':
            keyName = 'bejodousiMissbynininnsyodaimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion =
                'be going to,be able toを作る際にも，youまたは複数形の代名詞にはare,were,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bejodousiMissbysanninsyodaimeisi':
            keyName = 'bejodousiMissbysanninsyodaimeisi';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion =
                'be going to,be able toを作る際にも，三人称単数の代名詞にはis,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bejodousiMissbyTansuu':
            keyName = 'bejodousiMissbyTansuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion =
                'be going to,be able toを作る際にも，単数形の名詞にはis,was,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'bejodousiMissbyhukusuu':
            keyName = 'bejodousiMissbyhukusuu';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion =
                'be going to,be able toを作る際にも，複数形の名詞にはare,were,been,beingのみbe動詞が使えます。活用形を変えるか、主語を変えてみましょう';
            break;
        case 'houJodousiMissbynotgenkei':
            keyName = 'houJodousiMissbynotgenkei';
            GCR.errors[keyName] = { ...errorTemplete };
            GCR.errors[keyName].part = 'V';
            GCR.errors[keyName].index = GCR.currentIndex;
            GCR.errors[keyName].type = '助動詞ミス！';
            GCR.errors[keyName].reason = '助動詞の作り方を間違えています';
            GCR.errors[keyName].suggestion = '助動詞の次に完了形のhaveや受け身、進行形のbe動詞を置きたいときは原型にしましょう';
            break;
    }

    return GCR;
}

function pointManager(GCR) {
    let keyName;
    if (GCR['allOfVTags'].dousi.includes('be動詞')) {
        //be動詞を含んでいたら
        keyName = 'be動詞';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 200;
    }
    if (GCR['allOfVTags'].dousi.includes('三単現s')) {
        //三単現sを含んでいたら
        keyName = '三単現s';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (GCR['allOfVTags'].houjodousi.includes('法助動詞') || GCR['allOfVTags'].houjodousi.includes('疑似法助動詞')) {
        //法助動詞を含んでいたら
        keyName = '助動詞';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (GCR['allOfVTags'].houjodousi.includes('未来')) {
        //未来型なら
        keyName = '未来';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 500;
    }
    if (GCR['allOfVTags'].houjodousi.includes('beableto')) {
        //be able toなら
        keyName = 'be able to';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 500;
    }
    if (GCR['allOfVTags'].jodousi.includes('be動詞') && GCR['allOfVTags'].jodousi.includes('原型') && GCR['allOfVTags'].dousi.includes('現在分詞')) {
        //現在進行形なら
        keyName = '現在進行形';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (
        GCR['allOfVTags'].jodousi.includes('be動詞') &&
        GCR['allOfVTags'].jodousi.includes('過去形') &&
        GCR['allOfVTags'].dousi.includes('現在分詞')
    ) {
        //過去進行形なら
        keyName = '過去進行形';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (GCR['allOfVTags'].jodousi.includes('be動詞') && GCR['allOfVTags'].dousi.includes('過去分詞')) {
        //受け身なら
        keyName = '受け身';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (GCR['allOfVTags'].jodousi.includes('have') && GCR['allOfVTags'].dousi.includes('過去分詞')) {
        //現在完了形なら
        keyName = '現在完了形';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 300;
    }
    if (GCR['allOfVTags'].jodousi.includes('have') && GCR['allOfVTags'].dousi.includes('現在分詞')) {
        //現在完了進行形なら
        keyName = '現在完了進行形';
        GCR.points[keyName] = { ...pointTemplete };
        GCR.points[keyName].pointName = keyName;
        GCR.points[keyName].pointValue += 400;
    }
    return GCR;
}

function checkTotalGrammerMatters(GCR) {
    //主語と動詞の対応（助動詞が付いていない場合）
    if (!GCR['allOfVTags'].houjodousi.includes('false') && !GCR['allOfVTags'].jodousi.includes('false')) {
        if (GCR['allOfVTags'].dousi.includes('be動詞')) {
            //be動詞の場合
            try {
                if (
                    GCR['allOfSTags'].daimeisi.includes('一人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    GCR['allOfSTags'].daimeisi.includes('主格') &&
                    !GCR['allOfVTags'].dousi.includes('一人称')
                ) {
                    /*Iにつかないbe動詞をつけている */ errorManager(GCR, '', 'bedousiMissbyitininsyodaimeisi');
                }
                if (
                    ((GCR['allOfSTags'].daimeisi.includes('二人称') &&
                        GCR['allOfSTags'].daimeisi.includes('単数') &&
                        GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        GCR['allOfSTags'].daimeisi.includes('複数')) &&
                    !GCR['allOfVTags'].dousi.includes('二人称')
                ) {
                    /*you,複数形につかないbe動詞をつけている */ errorManager(GCR, '', 'bedousiMissbynininnsyodaimeisi');
                }
                if (
                    GCR['allOfSTags'].daimeisi.includes('三人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    !GCR['allOfVTags'].dousi.includes('三人称')
                ) {
                    /*三人称につかないbe動詞 */ errorManager(GCR, '', 'bedousiMissbysanninsyodaimeisi');
                }
            } catch (e) {
                if (
                    (GCR['allOfSTags'].meisi.includes('単数形') || GCR['allOfSTags'].meisi.includes('不可算名詞')) &&
                    !GCR['allOfVTags'].dousi.includes('三人称')
                ) {
                    /*単数形の名詞にis以外をつけている場合 */ errorManager(GCR, '', 'bedousiMissbyTansuu');
                }
                if (GCR['allOfSTags'].meisi.includes('複数形') && !GCR['allOfVTags'].dousi.includes('二人称')) {
                    /*複数形の名詞にare以外をつけている場合 */ errorManager(GCR, '', 'bedousiMissbyhukusuu');
                }
            }
        } else {
            //一般動詞の場合
            try {
                if (
                    ((GCR['allOfSTags'].daimeisi.includes('二人称') &&
                        GCR['allOfSTags'].daimeisi.includes('単数') &&
                        GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        (GCR['allOfSTags'].daimeisi.includes('一人称') &&
                            GCR['allOfSTags'].daimeisi.includes('単数') &&
                            GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        GCR['allOfSTags'].daimeisi.includes('複数')) &&
                    GCR['allOfVTags'].dousi.includes('三単現s')
                ) {
                    /*I,youに三単現sをつけている場合 */ errorManager(GCR, '', 'SantangensMissbyIyouwe');
                }
                if (
                    GCR['allOfSTags'].daimeisi.includes('三人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    GCR['allOfSTags'].daimeisi.includes('主格') &&
                    GCR['allOfVTags'].dousi.includes('原型')
                ) {
                    /*三人称単数現在形に原型をつけている場合 */ errorManager(GCR, '', 'SantangensMissbygenkei');
                }
            } catch (e) {
                if (
                    (GCR['allOfSTags'].meisi.includes('単数形') || GCR['allOfSTags'].meisi.includes('不可算名詞')) &&
                    GCR['allOfVTags'].dousi.includes('原型')
                ) {
                    /*単数形の名詞に原型をつけている場合 */ errorManager(GCR, '', 'SantangensMissbygenkei');
                }
                if (GCR['allOfSTags'].meisi.includes('複数形') && GCR['allOfVTags'].dousi.includes('三単現s')) {
                    /*複数形の名詞に三単現sをつけている場合 */ errorManager(GCR, '', 'SantangensMissbyhukusuu');
                }
            }
        }
    }

    //主語+疑似法助動詞+動詞
    if (GCR['allOfVTags'].houjodousi.includes('疑似法助動詞') && GCR['allOfVTags'].jodousi.includes('false')) {
        if (!GCR['allOfVTags'].dousi.includes('原型')) {
            /*助動詞に原型以外の動詞をつけている場合*/ errorManager(GCR, '', 'JodousiMissbynotgenkei');
        }
        if (GCR['allOfVTags'].houjodousi.includes('have')) {
            /* haveと主語の対応が違う場合*/
            try {
                if (
                    ((GCR['allOfSTags'].daimeisi.includes('二人称') &&
                        GCR['allOfSTags'].daimeisi.includes('単数') &&
                        GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        (GCR['allOfSTags'].daimeisi.includes('一人称') &&
                            GCR['allOfSTags'].daimeisi.includes('単数') &&
                            GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        GCR['allOfSTags'].daimeisi.includes('複数')) &&
                    GCR['allOfVTags'].houjodousi.includes('三単現s')
                ) {
                    /*I,you,weに三単現sをつけている場合 */ errorManager(GCR, '', 'havetoMissbyIyouwe');
                }
                if (
                    GCR['allOfSTags'].daimeisi.includes('三人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    GCR['allOfSTags'].daimeisi.includes('主格') &&
                    GCR['allOfVTags'].houjodousi.includes('原型')
                ) {
                    /*三人称単数現在形に原型をつけている場合 */ errorManager(GCR, '', 'havetoMissbygenkei');
                }
            } catch (e) {
                if (
                    (GCR['allOfSTags'].meisi.includes('単数形') || GCR['allOfSTags'].meisi.includes('不可算名詞')) &&
                    GCR['allOfVTags'].houjodousi.includes('原型')
                ) {
                    /*単数形の名詞に原型をつけている場合 */ errorManager(GCR, '', 'havetoMissbygenkei');
                }
                if (GCR['allOfSTags'].meisi.includes('複数形') && GCR['allOfVTags'].houjodousi.includes('三単現s')) {
                    /*複数形の名詞に三単現sをつけている場合 */ errorManager(GCR, '', 'havetoMissbyhukusuu');
                }
            }
        }
        if (GCR['allOfVTags'].houjodousi.includes('be')) {
            //be going to be able to と主語の対応が違う場合
            try {
                if (
                    GCR['allOfSTags'].daimeisi.includes('一人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    GCR['allOfSTags'].daimeisi.includes('主格') &&
                    !GCR['allOfVTags'].houjodousi.includes('一人称')
                ) {
                    /*Iにつかないbe動詞をつけている */ errorManager(GCR, '', 'bejodousibyitininsyodaimeisi');
                }
                if (
                    ((GCR['allOfSTags'].daimeisi.includes('二人称') &&
                        GCR['allOfSTags'].daimeisi.includes('単数') &&
                        GCR['allOfSTags'].daimeisi.includes('主格')) ||
                        GCR['allOfSTags'].daimeisi.includes('複数')) &&
                    !GCR['allOfVTags'].houjodousi.includes('二人称')
                ) {
                    /*you,複数形につかないbe動詞をつけている */ errorManager(GCR, '', 'bejodousiMissbynininnsyodaimeisi');
                }
                if (
                    GCR['allOfSTags'].daimeisi.includes('三人称') &&
                    GCR['allOfSTags'].daimeisi.includes('単数') &&
                    !GCR['allOfVTags'].houjodousi.includes('三人称')
                ) {
                    /*三人称につかないbe動詞 */ errorManager(GCR, '', 'bejodousiMissbysanninsyodaimeisi');
                }
            } catch (e) {
                if (
                    (GCR['allOfSTags'].meisi.includes('単数形') || GCR['allOfSTags'].meisi.includes('不可算名詞')) &&
                    !GCR['allOfVTags'].houjodousi.includes('三人称')
                ) {
                    /*単数形の名詞にis以外をつけている場合 */ errorManager(GCR, '', 'bejodousiMissbyTansuu');
                }
                if (GCR['allOfSTags'].meisi.includes('複数形') && !GCR['allOfVTags'].houjodousi.includes('二人称')) {
                    /*複数形の名詞にare以外をつけている場合 */ errorManager(GCR, '', 'bejodousiMissbyhukusuu');
                }
            }
        }
    }

    if (GCR['allOfVTags'].jodousi.includes('false')) {
        //主語+法助動詞+動詞（相助動詞がない場合）
        if (GCR['allOfVTags'].houjodousi.includes('法助動詞')) {
            if (!GCR['allOfVTags'].dousi.includes('原型')) {
                /*助動詞に原型以外の動詞をつけている場合*/ errorManager(GCR, '', 'JodousiMissbynotgenkei');
            }
        }
    } else {
        //主語+法助動詞+動詞（相助動詞がある場合）
        if (GCR['allOfVTags'].houjodousi.includes('法助動詞')) {
            if (!GCR['allOfVTags'].jodousi.includes('原型')) {
                /*法助動詞に原型以外の助動詞をつけている場合*/ errorManager(GCR, '', 'houJodousiMissbynotgenkei');
            }
        }
    }

    return GCR;
}

console.log('checkGrammer結果：', checkGrammerTestArray, checkGrammer(checkGrammerTestArray));
