const API_SERVER_URL = 'http://localhost:8081/v2/check';

const testPassage = 'I can eaten by you.';

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

        const data = await response.json();
        console.log('Response data:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

grammarCheck(testPassage);
