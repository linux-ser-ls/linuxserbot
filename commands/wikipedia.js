const wiki = require('wikipedia');

async function wikipediaCommand(
    sock,
    chatId,
    message,
    args
) {
    try {

        if (!args.length) {
            return await sock.sendMessage(
                chatId,
                {
                    text: `╭───❮ *ᴡɪᴋɪᴘᴇᴅɪᴀ* ❯
│
├ 📚 ꜱᴇᴀʀᴄʜ ᴛᴏᴘɪᴄꜱ
│
├ ⚡ ᴜꜱᴀɢᴇ:
│   .ᴡɪᴋɪᴘᴇᴅɪᴀ <ᴛᴏᴘɪᴄ>
│
├ 📖 ᴇxᴀᴍᴘʟᴇꜱ:
│   .ᴡɪᴋɪᴘᴇᴅɪᴀ ᴋᴇʀᴀʟᴀ
│   .ᴡɪᴋɪᴘᴇᴅɪᴀ ᴄʀɪꜱᴛɪᴀɴᴏ ʀᴏɴᴀʟᴅᴏ
│   .ᴡɪᴋɪᴘᴇᴅɪᴀ ᴊᴀᴠᴀꜱᴄʀɪᴘᴛ
│
╰─────────────⦁`
                },
                { quoted: message }
            );
        }

        const query = args.join(' ');

        const processing = await sock.sendMessage(
            chatId,
            {
                text: '_📚 Searching Wikipedia..._'
            },
            { quoted: message }
        );

        const page = await wiki.page(query);

        const summary = await page.summary();

        const result =
`📚 Wikipedia

🔎 Topic: ${summary.title}

📝 ${summary.extract.substring(0, 3000)}

🌐 ${summary.content_urls?.desktop?.page || 'No URL available'}`;

        await sock.sendMessage(
            chatId,
            {
                text: result,
                edit: processing.key
            }
        );

    } catch (error) {

        console.error('Wikipedia Error:', error);

        await sock.sendMessage(
            chatId,
            {
                text:
`❌ No Wikipedia article found for:

${args.join(' ')}`
            },
            { quoted: message }
        );
    }
}

module.exports = wikipediaCommand;