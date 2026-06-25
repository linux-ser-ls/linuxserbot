const fs = require("fs");
const path = require("path");
const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

async function setMenuImg(sock, chatId, message) {

    try {

        const quoted =
            message.message?.extendedTextMessage
            ?.contextInfo?.quotedMessage;

        if (!quoted?.imageMessage) {
            return await sock.sendMessage(chatId, {
                text: "❌ Reply to an image"
            }, {
                quoted: message
            });
        }

        let buffer = Buffer.from([]);

        const stream =
            await downloadContentFromMessage(
                quoted.imageMessage,
                "image"
            );

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const savePath = path.join(
            __dirname,
            "../assets/bot_image.jpg"
        );

        fs.writeFileSync(savePath, buffer);

        await sock.sendMessage(chatId, {
            text: "✅ Menu image updated successfully"
        }, {
            quoted: message
        });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(chatId, {
            text: "❌ Failed to update image"
        }, {
            quoted: message
        });
    }
}

module.exports = setMenuImg;