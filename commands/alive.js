const settings = require("../settings");
const fs = require("fs");

async function aliveCommand(sock, chatId, message) {
    try {
        // React
        await sock.sendMessage(chatId, {
            react: {
                text: "🎯",
                key: message.key
            }
        });

        const username = message.pushName || "User";

        // Uptime
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const aliveText = `👋 ʜᴇʏ ${username},
 ɪ ᴀᴍ 𝐋ɪɴᴜx 𝐒ᴇʀ ᴡʜᴀᴛꜱᴀᴩᴩ ʙᴏᴛ ᴀʟɪᴠᴇ ɴᴏᴡ!

📌 ᴛʏᴩᴇ *".ᴍᴇɴᴜ"* ᴛᴏ ɢᴇᴛ ᴍʏ ᴄᴏᴍᴍᴀɴᴅ ʟɪꜱᴛ.

⚡ ᴠᴇʀꜱɪᴏɴ: ${settings.version || "3.0.7"}
⏰ ʀᴜɴᴛɪᴍᴇ: ${hours}ʜ ${minutes}ᴍ ${seconds}ꜱ`;

        await sock.sendMessage(
            chatId,
            {
                text: aliveText,
                
            },
            { quoted: message }
        );

    } catch (error) {
        console.error("Alive Command Error:", error);

        await sock.sendMessage(
            chatId,
            {
                text: "❌ Failed to check bot status."
            },
            { quoted: message }
        );
    }
}

module.exports = aliveCommand;
