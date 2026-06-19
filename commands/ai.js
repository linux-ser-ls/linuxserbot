require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(
process.env.GEMINI_API_KEY
);

async function aiCommand(
sock,
chatId,
message,
args
) {
let processing;

try {

    if (!args.length) {
        return await sock.sendMessage(
            chatId,
            {
                text:

`🤖 AI Chat

Usage:
.ai <question>

Example:
.ai Hello
.ai What is JavaScript?
.ai Write a poem`
},
{ quoted: message }
);
}

    const prompt = args.join(' ');

    processing =
        await sock.sendMessage(
            chatId,
            {
                text: '🤖 Thinking...'
            },
            { quoted: message }
        );

    const model =
        genAI.getGenerativeModel({
            model: 'gemini-1.5-flash'
        });

    const result =
        await model.generateContent(
            prompt
        );

    const reply =
        result.response.text();

    await sock.sendMessage(
        chatId,
        {
            text:

`${reply}`,
edit: processing.key
}
);

} catch (error) {

    console.error(
        'AI Error:',
        error
    );

    if (processing) {

        await sock.sendMessage(
            chatId,
            {
                text:

`❌ AI Error

${error.message}`,
edit: processing.key
}
);

    } else {

        await sock.sendMessage(
            chatId,
            {
                text:

`❌ AI Error

${error.message}`
},
{ quoted: message }
);

    }
}

}

module.exports = aiCommand;
