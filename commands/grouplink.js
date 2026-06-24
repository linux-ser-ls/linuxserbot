async function grouplinkCommand(sock, chatId, message) {
    try {

        // Group only
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: '❌ This command only works in groups.'
            }, { quoted: message });
        }

        // React
        await sock.sendMessage(chatId, {
            react: {
                text: '🔗',
                key: message.key
            }
        });

        // Get group invite code
        const inviteCode = await sock.groupInviteCode(chatId);
        const link = `https://chat.whatsapp.com/${inviteCode}`;

        await sock.sendMessage(chatId, {
            text: `🧃🕊️ *𝐋ɪɴᴜx 𝐒ᴇʀ • ɢʀᴏᴜᴘ ʟɪɴᴋ*\n\n🔗: ${link}`
        }, { quoted: message });

    } catch (error) {

        console.error('Group Link Error:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to get group link.\n\nMake sure I am an admin.'
        }, { quoted: message });
    }
}

module.exports = grouplinkCommand;
