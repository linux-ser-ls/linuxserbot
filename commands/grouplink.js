async function groupLinkCommand(sock, chatId, message) {
try {

    // Group only
    if (!chatId.endsWith("@g.us")) {
        return await sock.sendMessage(chatId, {
            text: "❌ This command only works in groups."
        }, { quoted: message });
    }

    // Get invite code
    const code = await sock.groupInviteCode(chatId);
    const link = `https://chat.whatsapp.com/${code}`;

    // Send link
    await sock.sendMessage(chatId, {
        text: `🧃🕊️ *𝐋ɪɴᴜx 𝐒ᴇʀ • ɢʀᴏᴜᴘ ʟɪɴᴋ*\n\n🔗: ${link}`
    }, { quoted: message });

} catch (error) {

    console.error("Group Link Error:", error);

    await sock.sendMessage(chatId, {
        text: "❌ Failed to get group link.\n\nMake sure I'm an admin."
    }, { quoted: message });
}

}

module.exports = groupLinkCommand;
