const API_SERVER_URL = 'http://localhost:11434/api/generate';

const testPassage = 'I can is eaten by you.';

async function grammarCheck(testPassage) {
    const response = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'grammarCheck:latest',
            prompt: `${testPassage}`,
            format: 'json',
            stream: false,
        }),
    });

    const data = await response.json();
    console.log(data);
    const parsed = JSON.parse(data.response);
    console.log(parsed);
}

grammarCheck(testPassage);
