import { tango } from './public/js/utils/wordData.js';

const rules = {
    SV: [
        ['be動詞根', 'a-be動詞'],
        ['S', 'be動詞根'],
    ],
    S: [['a-主語に使える代名詞']],
    助動詞根: [['a-助動詞']],
    be動詞根: [['助動詞根', 'a-be動詞']],
};

const DaimeisicanSArray = ['主格', '指示代名詞', '不定代名詞', '疑問代名詞'];

const check = ['can', 'is', 'be'];
let targetIndex = 0;
console.log(checkGrammer('SV'));
function checkGrammer(rule) {
    console.log(rule);
    if (rule == '') return;
    if (rule.split('-').length == 2) {
        const ei = rule.split('-')[1];
        if (ei == '主語に使える代名詞') {
            if (DaimeisicanSArray.some((value) => tango[check[targetIndex]].tags.includes(value))) {
                targetIndex++;
                return true;
            } else {
                targetIndex++;
                return false;
            }
        }
        if (ei == 'be動詞') {
            if (tango[check[targetIndex]].tags.includes(ei)) {
                targetIndex++;
                return true;
            } else {
                targetIndex++;
                return false;
            }
        }

        if (tango[check[targetIndex]].hinsi.includes(ei)) {
            targetIndex++;
            return true;
        } else {
            targetIndex++;
            return false;
        }
    } else {
        let flag2 = false;
        rules[rule].forEach((rr) => {
            let flag = true;
            rr.forEach((rrr) => {
                if (!checkGrammer(rrr)) {
                    flag = false;
                }
            });

            if (flag) {
                return true;
            } else {
                targetIndex -= rr.length - 1;
            }
        });
    }
}

/*

<A>: <B>|<C>
<B>:<B><D>|<E>
<C>:<F>|<G>
<D>:'a'
*/
