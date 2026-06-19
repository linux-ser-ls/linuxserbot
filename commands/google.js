const googleIt = require('google-it');

async function googleCommand(sock, chatId, message, args) {
try {


    if (!args.length) {
        return await sock.sendMessage(
            chatId,
            {
                text:

`🔎 Google Search

Usage:
.google <query>

Example:
.google What is ai?`
},
{ quoted: message }
);
}

    const query = args.join(' ');

    const processing = await sock.sendMessage(
        chatId,
        {
            text: '🔎 Searching Google...'
        },
        { quoted: message }
    );

    const results = await googleIt({
        query
    });

    if (!results || results.length === 0) {
        return await sock.sendMessage(chatId, {
            text: '❌ No results found.',
            edit: processing.key
        });
    }

    let text =

`🔎 Google Results For: ${query}

`;

    results.slice(0, 5).forEach((result, index) => {
        text +=

`${index + 1}. ${result.title}

🌐 ${result.link}

📝 ${result.snippet || 'No description'}

`;
});

    await sock.sendMessage(
        chatId,
        {
            text,
            edit: processing.key
        }
    );

} catch (error) {

    console.error(
        'Google Search Error:',
        error
    );

    await sock.sendMessage(
        chatId,
        {
            text:

`❌ Search Failed

${error.message}`
},
{ quoted: message }
);
}
}

module.exports = googleCommand;
