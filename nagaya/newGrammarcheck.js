const API_SERVER_URL = 'http://localhost:11434/api/generate';

const testPassage = '日本の英語教師として、I can is eaten by you.を日本語に訳してください。';

async function grammarCheck(testPassage) {
    const response = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'qwen3:14b',
            prompt: testPassage,
            stream: false,
        }),
    });

    const data = response;
    console.log('data:', data);
}

grammarCheck(testPassage);
