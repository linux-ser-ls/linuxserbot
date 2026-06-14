async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();

        await sock.sendMessage(chatId, {
            react: {
                text: '⚡',
                key: message.key
            }
        });

        const tempMsg = await sock.sendMessage(
            chatId,
            { text: '⚡ Checking speed...' },
            { quoted: message }
        );

        const end = Date.now();
        const ping = end - start;

        const pingText = `*📡 ᴘᴏɴɢ! ${ping}ᴍꜱ*`;

        await sock.sendMessage(chatId, {
            text: pingText,
            edit: tempMsg.key
        });

    } catch (error) {
        console.error('Error in ping command:', error);

        await sock.sendMessage(
            chatId,
            { text: '❌ Failed to get ping.' },
            { quoted: message }
        );
    }
}

module.exports = pingCommand;
