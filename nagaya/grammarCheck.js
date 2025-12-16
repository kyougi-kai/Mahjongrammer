import { tango } from '../public/js/utils/wordData.js';

const LT_API_URL = 'http://localhost:8081/v2/check';
const SPACY_API_URL = 'http://localhost:8080/parse';

<<<<<<< Updated upstream
const testPassage = 'I have never seen such a beautiful scenery before.';
=======
//const testPassage = 'I want to my stands by you.';
const testPassage = 'Want I stand.';
>>>>>>> Stashed changes

function checkGrammar(sentence) {
  const tokens = tokenize(sentence);

  const skeleton = buildSkeleton(tokens);

  console.log('Skeleton:', skeleton);
//   const sentenceType = resolveSentenceType(skeleton);

//   const errors = validateConstraints(skeleton, sentenceType);

//   if (errors.length > 0) {
//     return formatErrorJson(errors);
//   }

//   const points = collectPoints(skeleton, sentenceType);

//   return formatSuccessJson(points);
}

async function tokenize(sentence) {
       try {
        const response = await fetch(SPACY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: sentence }),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log('spaCy result:', data.tokens);
        return data.tokens;
    } catch (error) {
        console.error('spaCy error:', error.message);
    } 
}

function buildSkeleton(tokens) {
  const verbUnit = extractMainVerbUnit(tokens);//動詞から先につくる
  const subject = extractSubject(tokens, verbUnit);//まだ
  const { objects, complement } = extractComplements(tokens, verbUnit);//まだ

  return {
    subject,
    verb: verbUnit,
    objects,
    complement,
    modifiers: {
      adverbs: verbUnit.adverbs,
      prepositionalPhrases: extractPrepositionalPhrases(tokens)
    }
  };
}

function extractMainVerbUnit(tokens) {
    //主動詞（V）を抽出
  const root = tokens.find(t => t.dep === "ROOT");

  if (!root) return null;

  const unit = {
    head: root,
    auxiliaries: [],//助動詞など
    adverbs: [],//副詞など
    negation: null,//notなど
    markers: []
    //追加で他動詞等の情報を入れ、エラーチェックに使う
  };

  for (const child of root.children) {
    if (child.dep === "aux" || child.dep === "auxpass") {
      unit.auxiliaries.push(child);
    }

    if (child.dep === "advmod") {
      unit.adverbs.push(child);
    }

    if (child.dep === "neg") {
      unit.negation = child;
    }

    if (child.dep === "mark") {
      unit.markers.push(child);
    }
  }

  return unit;
}

function resolveSentenceType(skeleton) {
    //文型を判定する
  if (skeleton.object && skeleton.complement) return "SVOC";
  if (skeleton.object && skeleton.object2) return "SVOO";
  if (skeleton.object) return "SVO";
  if (skeleton.complement) return "SVC";
  return "SV";
}

async function checkByLT(testPassage) {
    try {
        const params = new URLSearchParams();
        params.append('text', testPassage);
        params.append('language', 'en-US');

        const response = await fetch(LT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('Grammar check response:', data.matches[0].message);
            return data.matches[0].message;
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.error('Raw response:', text);
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

function validateConstraints(skeleton, sentenceType) {
    //エラーチェック
  const errors = [];

  let LTResult = checkByLT(sentence);
    if (LTResult) {
        errors.push({
            reason: LTResult,
            suggestion: ""
        });
    }

  if (!skeleton.subject) {
    errors.push({
      reason: "主語がありません",
      suggestion: "主語を追加してください"
    });
  }

  if (!skeleton.verb) {
    errors.push({
      reason: "動詞がありません",
      suggestion: "動詞を追加してください"
    });
  }

  if (
    skeleton.verb?.verbType === "transitive" &&
    !skeleton.object
  ) {
    errors.push({
      reason: "他動詞には目的語が必要です",
      suggestion: "目的語を追加してください"
    });
  }

  return errors;
}

function collectPoints(skeleton, sentenceType) {
    //ポイント判定
  const points = [];

  points.push({
    pointName: sentenceType,
    pointValue: 0
  });

  if (skeleton.verb?.tense === "presentPerfect") {
    points.push({
      pointName: "現在完了形",
      pointValue: 0
    });
  }

  return points;
}

function formatErrorJson(errors) {
    //エラーの場合のjson出力
  const obj = {};
  errors.forEach((e, i) => {
    obj[i + 1] = e;
  });

  return {
    success: false,
    errors: obj,
    points: {}
  };
}

function formatSuccessJson(points) {
    //成功の場合のjson出力
  const obj = {};
  points.forEach((p, i) => {
    obj[i + 1] = p;
  });

  return {
    success: true,
    errors: {},
    points: obj
  };
}








async function spaCy(testPassage) {
    try {
        const response = await fetch(SPACY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: testPassage }),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log('spaCy result:', data.tokens);
    } catch (error) {
        console.error('spaCy error:', error.message);
    }
}

// 実行

//checkGrammar(testPassage);
//checkByLT(testPassage);
spaCy(testPassage);
//tokenize(testPassage);