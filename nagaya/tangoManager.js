function addMeansToTango(csvLines) {
    for (const line of csvLines) {
        // 1行をカンマで分割
        const [word, meaning] = line.split(',');

        if (word && meaning && tango[word]) {
            tango[word].hinsi = ['動詞'];
            tango[word].means = { 動詞: meaning.trim() };
        }
    }
}

const rawCsvText = `

`.trim();

//改行で分割し、1行ずつをクォーテーションで囲う配列に変換
const csvData = rawCsvText.split('\n').map((line) => `${line.trim()}`);

console.log(csvData);

addMeansToTango(csvData);

console.log(JSON.stringify(tango, null, 2));

function expandTangoEntries(tango) {
    const expanded = {};

    const tagMap = ['原型', '三単現s', '過去形', '過去分詞', '現在分詞'];

    for (const key in tango) {
        const entry = tango[key];
        const { katuyou, tags, hinsi, means } = entry;

        katuyou.forEach((form, i) => {
            // 初めて出た活用形
            if (!expanded[form]) {
                expanded[form] = {
                    tags: [...tags, tagMap[i]],
                    katuyou: [...katuyou],
                    hinsi: [...hinsi],
                    means: { ...means },
                };
            } else {
                // すでに存在する → タグを追加（重複除去）
                const currentTags = new Set(expanded[form].tags);
                currentTags.add(tagMap[i]);
                tags.forEach((t) => currentTags.add(t));
                expanded[form].tags = Array.from(currentTags);

                // 他は同じなので上書き不要
            }
        });
    }

    return expanded;
}

const expanded = expandTangoEntries(tango);
console.log(expanded);
