const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ---------- MAIN ----------
async function renameCommand(sock, chatId, message, text = '') {

try {

    // ---------- CHECK MEDIA ----------
    const context = message.message?.extendedTextMessage?.contextInfo;
    const quoted = context?.quotedMessage;

    const media =
        quoted?.audioMessage ||
        quoted?.documentMessage ||
        message.message?.audioMessage ||
        message.message?.documentMessage;

    if (!media) {
        return sock.sendMessage(chatId, {
            text: '❌ Reply to an audio or document file.'
        }, { quoted: message });
    }

    // ---------- STATUS ----------
    const progress = await sock.sendMessage(chatId, {
        text: '🎵 Processing audio...'
    }, { quoted: message });

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    // ---------- DOWNLOAD MEDIA ----------
    const buffer = await downloadMediaMessage(
        {
            key: message.key,
            message: quoted || message.message
        },
        'buffer',
        {},
        {}
    );

    if (!buffer) {
        return sock.sendMessage(chatId, {
            text: '❌ Failed to download media.'
        }, { quoted: message });
    }

    // ---------- SAVE FILE ----------
    const filePath = path.join('./temp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, buffer);

    // ---------- COVER IMAGE ----------
    const coverPath = path.join(__dirname, 'assets', 'bot_image.jpg');

    let coverBuffer = null;
    if (fs.existsSync(coverPath)) {
        coverBuffer = fs.readFileSync(coverPath);
    }

    // ---------- TAGS (FIXED NODEID3 FORMAT) ----------
    const tags = {
        title: '♪ 𝐕ɪʙᴇ 𝐁ʏ 𝐋ꜱ',
        artist: '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓',
        album: '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓',
        APIC: coverBuffer
            ? {
                mime: 'image/jpeg',
                type: 3,
                description: 'cover',
                imageBuffer: coverBuffer
            }
            : undefined
    };

    NodeID3.write(tags, filePath);

    // ---------- SUCCESS ----------
    await sock.sendMessage(chatId, {
        text: '✅ Audio tagged successfully',
        edit: progress.key
    });

    await sock.sendMessage(chatId, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: 'renamed.mp3'
    }, { quoted: message });

    fs.unlinkSync(filePath);

} catch (err) {

    console.error('Rename Error:', err);

    await sock.sendMessage(chatId, {
        text: `❌ Error:\n${err.message}`
    }, { quoted: message });

}

}

module.exports = renameCommand;
