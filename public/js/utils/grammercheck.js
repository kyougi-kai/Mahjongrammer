import { tango } from '/js/utils/wordData.js';

const errorTemplete = {
    part: '',
    index: 0,
    type: '',
    reason: '',
    suggestion: '',
};

export function checkGrammer(targetArray) {
    targetArray.sentence = targetArray.sentence.toString();

    /**
     * @typedef {Object} gcr
     * @property {boolean} success -成功-
     */

    /** @type {gcr} 文法チェックの結果を代入（旧grammerCheckResult）*/
    let GCR = {
        success: false,
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
            GCR.successes = { S: [], V: [] };
            GCR.currentType.push('S', 'V');
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            if (
                GCR.successes.S.includes('true') &&
                GCR.successes.V.includes('true') &&
                !GCR.successes.S.includes('false') &&
                !GCR.successes.V.includes('false')
            ) {
                GCR.success = true;
            }
            break;
        case '2': //第二文型SVC
            GCR.successes = { S: [], V: [], C: [] };
            GCR.currentType.push('S', 'V', 'C');
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkC(targetArray.c, GCR);
            GCR.currentTypeNum++;
            if (
                GCR.successes.S.includes('true') &&
                GCR.successes.V.includes('true') &&
                !GCR.successes.S.includes('false') &&
                !GCR.successes.V.includes('false') &&
                GCR.successes.C.includes('true') &&
                !GCR.successes.C.includes('false')
            ) {
                GCR.success = true;
            }
            break;
        case '3': //第三文型SVO
            GCR.successes = { S: [], V: [], O1: [] };
            GCR.currentType.push('S', 'V', 'O1');
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            if (
                GCR.successes.S.includes('true') &&
                GCR.successes.V.includes('true') &&
                !GCR.successes.S.includes('false') &&
                !GCR.successes.V.includes('false') &&
                GCR.successes.O1.includes('true') &&
                !GCR.successes.O1.includes('false')
            ) {
                GCR.success = true;
            }
            break;
        case '4': //第四文型SVOO
            GCR.successes = { S: [], V: [], O1: [], O2: [] };
            GCR.currentType.push('S', 'V', 'O1', 'O2');
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            checkO(targetArray.o2, GCR);
            GCR.currentTypeNum++;
            if (
                GCR.successes.S.includes('true') &&
                GCR.successes.V.includes('true') &&
                !GCR.successes.S.includes('false') &&
                !GCR.successes.V.includes('false') &&
                GCR.successes.O1.includes('true') &&
                !GCR.successes.O1.includes('false') &&
                GCR.successes.O2.includes('true') &&
                !GCR.successes.O2.includes('false')
            ) {
                GCR.success = true;
            }
            break;
        case '5': //第五文型SVOC
            GCR.successes = { S: [], V: [], O1: [], C: [] };
            GCR.currentType.push('S', 'V', 'O1', 'C');
            checkS(targetArray.s, GCR);
            GCR.currentTypeNum++;
            checkV(targetArray.v, GCR, targetArray.sentence);
            GCR.currentTypeNum++;
            checkO(targetArray.o1, GCR);
            GCR.currentTypeNum++;
            checkC(targetArray.c, GCR);
            GCR.currentTypeNum++;
            if (
                GCR.successes.S.includes('true') &&
                GCR.successes.V.includes('true') &&
                !GCR.successes.S.includes('false') &&
                !GCR.successes.V.includes('false') &&
                GCR.successes.O1.includes('true') &&
                !GCR.successes.O1.includes('false') &&
                GCR.successes.C.includes('true') &&
                !GCR.successes.C.includes('false')
            ) {
                GCR.success = true;
            }
            break;
        default:
            GCR.message.push('存在しない文型を指定しています');
            break;
    }
    if ((GCR.success = true)) {
        GCR = exchangeToPoint(GCR);
    }
    return GCR;
}

function exchangeToPoint(GCR) {
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

function checkHukusiOfKeiyousi(targetSentence, GCR) {
    let hukusiCount = 0;

    while (
        hukusiCount < targetSentence[GCR[GCR.flagsNum].targetIndex].length &&
        tango[targetSentence[GCR[GCR.flagsNum].targetIndex][hukusiCount]].hinsi.includes('副詞') &&
        (tango[targetSentence[GCR[GCR.flagsNum].targetIndex][hukusiCount]].tags.includes('程度') ||
            tango[targetSentence[GCR[GCR.flagsNum].targetIndex][hukusiCount]].tags.includes('強調') ||
            tango[targetSentence[GCR[GCR.flagsNum].targetIndex][hukusiCount]].tags.includes('様態') ||
            tango[targetSentence[GCR[GCR.flagsNum].targetIndex][hukusiCount]].tags.includes('否定'))
    ) {
        hukusiCount++;
    }
    return hukusiCount;
} //形容詞の前に副詞があるかどうか

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
            GCR = errorManager(GCR, typeText, 'Daimeisi');
        }
    }
    return GCR;
}

function checkMeisiGrammerMatters(targetSentence, GCR) {
    console.log('checkMeisiGrammerMatters', targetSentence, GCR);
    if (GCR[GCR.flagsNum].kansi.length > 0 && !GCR[GCR.flagsNum].kansi.includes('false') && GCR[GCR.flagsNum].meisi.includes('false')) {
        /*名詞が入っていない場合*/ GCR = errorManager(GCR, '', 'MeisiNotExist');
    }
    if (GCR[GCR.flagsNum].kansi.includes('false') && GCR[GCR.flagsNum].meisi.includes('可算名詞')) {
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
    }
    //法助動詞の次に法助動詞が続いたらエラー、そのほかの助動詞はOK
    if (GCR['allOfVTags'].targetIndex < 0) {
        return GCR;
    }
    if (tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags.includes('法助動詞')) {
        GCR['allOfVTags'].houjodousi.push(tango[targetSentence[GCR['allOfVTags'].targetIndex]].tags); //タグを代入
        GCR['allOfVTags'].houjodousi = GCR['allOfVTags'].houjodousi.flat(Infinity);
        GCR['allOfVTags'].wordsCount += 1;
        GCR['allOfVTags'].targetIndex -= 1;
    } //法助動詞が存在する場合

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
    }
    return GCR;
}
