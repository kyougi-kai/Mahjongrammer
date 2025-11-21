let API_SERVER_URL = 'http://localhost:11434/api/generate';

let testPassage = 'He is running now.';

async function grammarCheck(testPassage) {
    let response = await fetch(API_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'grammarCheck:latest',
            prompt: `${testPassage}`,
            stream: false,
        }),
    });

    let data = await response.json();
    console.log(data);
    return data.result;
}
