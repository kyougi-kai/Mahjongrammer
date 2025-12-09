import Spacy from 'spacy-js';

const API_SERVER_URL = 'http://localhost:8081/v2/check';

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
        const nlp = Spacy.load('en_core_web_sm', 'http://localhost:8080');
        const doc = await nlp(testPassage);
        console.log('spaCy result:', doc);
    } catch (error) {
        console.error('spaCy error:', error.message);
    }
}

// 実行
grammarCheck(testPassage);
spaCy(testPassage);
