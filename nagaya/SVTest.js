import { execFile } from 'child_process';

function analyzeSentence(sentence) {
    return new Promise((resolve, reject) => {
        execFile('python', ['SVServer.py', sentence], { encoding: 'utf8' }, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(JSON.parse(stdout));
        });
    });
}

(async () => {
    const result = await analyzeSentence('He has made this machine.');
    console.log(result);
})();
