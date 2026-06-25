const fs = require("fs");
const path = require("path");
const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

async function setMenuAudio(sock, chatId, message) {

    try {

        const quoted =
            message.message?.extendedTextMessage
            ?.contextInfo?.quotedMessage;

        if (
            !quoted?.audioMessage &&
            !quoted?.documentMessage
        ) {
            return await sock.sendMessage(chatId, {
                text: "❌ Reply to an audio file"
            }, {
                quoted: message
            });
        }

        const audio =
            quoted.audioMessage ||
            quoted.documentMessage;

        let buffer = Buffer.from([]);

        const stream =
            await downloadContentFromMessage(
                audio,
                "audio"
            );

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const savePath = path.join(
            __dirname,
            "../assets/menu.mp3"
        );

        fs.writeFileSync(savePath, buffer);

        await sock.sendMessage(chatId, {
            text: "✅ Menu audio updated successfully"
        }, {
            quoted: message
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(chatId, {
            text: "❌ Failed to update audio"
        }, {
            quoted: message
        });
    }
}

module.exports = setMenuAudio;