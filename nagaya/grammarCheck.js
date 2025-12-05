const API_SERVER_URL = 'http://localhost:8081/v2/check';

const testPassage = 'I can be eaten by you.';

async function grammarCheck(testPassage) {
    try {
        const response = await fetch(API_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: `${testPassage}`,
                format: 'json',
                stream: false,
            }),
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log('Response data:', data);

        // data.responseが文字列かオブジェクトか確認
        if (typeof data.response === 'string') {
            const parsed = JSON.parse(data.response);
            console.log('Parsed:', parsed);
        } else {
            console.log('Response is already an object:', data.response);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

grammarCheck(testPassage);
