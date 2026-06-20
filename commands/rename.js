const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');


async function renameCommand(sock, chatId, message) {
try {

    const quotedMsg =
        message.message?.extendedTextMessage?.contextInfo;

    if (!quotedMsg) {
        return await sock.sendMessage(
            chatId,
            { text: '❌ Reply to an audio file.' },
            { quoted: message }
        );
    }

    const progressMsg = await sock.sendMessage(
        chatId,
        { text: '🎵 Processing Audio...' },
        { quoted: message }
    );

    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    }

    const buffer = await downloadMediaMessage(
        {
            key: quotedMsg.stanzaId
                ? {
                    remoteJid: chatId,
                    id: quotedMsg.stanzaId,
                    participant: quotedMsg.participant
                }
                : message.key,
            message: quotedMsg.quotedMessage
        },
        'buffer',
        {},
        {}
    );

    const audioPath = './temp/linuxser.mp3';

    fs.writeFileSync(audioPath, buffer);

    // node-id3 expects the correct tag keys and a Buffer/file path for cover.
    const tags = {
        title: '♪ 𝐕ɪʙᴇ 𝐁ʏ 𝐋ꜱ',
        artist: '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓',
        album: '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓',
        // (node-id3 doesn't support performerInfo for ID3v2 in the way you might expect)
        // performerInfo is left out to ensure tags are written reliably.
        image: './assets/bot_image.jpg'
    };

    // Ensure image path is absolute so node-id3 can read it reliably.
    const tagsToWrite = {
        ...tags,
        image: path.resolve(tags.image)
    };

    NodeID3.write(tagsToWrite, audioPath);

    await sock.sendMessage(chatId, {
        text: '✅ Audio Tagged Successfully',
        edit: progressMsg.key
    });

    await sock.sendMessage(
        chatId,
        {
            audio: fs.readFileSync(audioPath),
            mimetype: 'audio/mpeg',
            ptt: false,
            // name can help some clients display tags more consistently
            fileName: 'linuxser.mp3'
        },
        { quoted: message }
    );

    fs.unlinkSync(audioPath);

} catch (err) {
    console.error('Rename Error:', err);

    await sock.sendMessage(
        chatId,
        {
            text: `❌ Error:\n${err.message}`
        },
        { quoted: message }
    );
}

}

module.exports = renameCommand;
