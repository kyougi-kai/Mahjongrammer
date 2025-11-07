import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'あなたは優秀なアシスタントです。' },
            { role: 'user', content: 'Node.jsでOpenAI APIを呼びたいです。' },
        ],
    });

    console.log(response.choices[0].message.content);
}

run();
