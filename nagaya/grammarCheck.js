const API_SERVER_URL = 'http://localhost:8081/v2/check';
const SPACY_API_URL = 'http://localhost:8080/parse';

const testPassage = 'I want to my stands by you.';

async function grammarCheck(testPassage) {
    try {
        const params = new URLSearchParams();
        params.append('text', testPassage);
        params.append('language', 'en-US');

        const response = await fetch(API_SERVER_URL, {
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
            console.log('Grammar check response:', data);
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.error('Raw response:', text);
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
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
        console.log('spaCy result:', data);
    } catch (error) {
        console.error('spaCy error:', error.message);
    }
}

// 実行
grammarCheck(testPassage);
spaCy(testPassage);
