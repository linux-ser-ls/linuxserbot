const fs = require('fs');
const path = require('path');
const axios = require('axios');
const NodeID3 = require('node-id3');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ---------- Helpers ----------
function parseArgs(text = '') {
    const parts = text.split(',').map(v => v.trim());
    return {
        title: parts[0],
        artist: parts[1],
        album: parts[2],
        cover: parts[3]
    };
}

function isUrl(text = '') {
    return /^https?:\/\/\S+/i.test(text.trim());
}

async function downloadUrlBuffer(url) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000
    });
    return Buffer.from(res.data);
}

async function downloadWhatsAppMedia(message, type = 'audio') {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

// ---------- Usage Message ----------
const usageText = `🎧 *Rename Command Usage*

.reply to audio/document OR use URL

🧾 Format:
.rename title, artist, album, cover_url

📌 Example:
.rename Starboy, The Weeknd, Starboy Album, https://i.imgur.com/cover.jpg

⚡ Supported:
• WhatsApp audio reply
• Document file reply
• Direct MP3 URL

🎨 Cover is optional`;

// ---------- Main ----------
async function renameCommand(sock, chatId, message, text = '') {
try {

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg = message.message;

    const { title, artist, album, cover } = parseArgs(text);

    let buffer = null;
    let sourceType = null;

    const firstArg = text.split(',')[0]?.trim();

    // ---------- MEDIA DETECTION FIRST ----------
    if (firstArg && isUrl(firstArg)) {
        buffer = await downloadUrlBuffer(firstArg);
        sourceType = 'url';
    }
    else if (msg?.audioMessage || quoted?.audioMessage) {
        buffer = await downloadWhatsAppMedia(
            msg?.audioMessage || quoted?.audioMessage,
            'audio'
        );
        sourceType = 'audio';
    }
    else if (msg?.documentMessage || quoted?.documentMessage) {
        buffer = await downloadWhatsAppMedia(
            msg?.documentMessage || quoted?.documentMessage,
            'document'
        );
        sourceType = 'document';
    }

    // ---------- INVALID INPUT ----------
    if (!buffer) {
        await sock.sendMessage(chatId, {
            react: { text: "❌", key: message.key }
        });

        return sock.sendMessage(chatId, {
            text: usageText
        }, { quoted: message });
    }

    // ---------- VALID COMMAND REACTION ONLY HERE ----------
    await sock.sendMessage(chatId, {
        react: { text: "🎧", key: message.key }
    });

    // ---------- TEMP FILE ----------
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    const filePath = path.join('./temp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, buffer);

    // ---------- COVER ----------
    let coverBuffer = null;
    if (cover && isUrl(cover)) {
        try {
            const res = await axios.get(cover, {
                responseType: 'arraybuffer'
            });
            coverBuffer = Buffer.from(res.data);
        } catch {}
    }

    // ---------- TAGGING ----------
    NodeID3.write({
        title: title || 'Unknown Title',
        artist: artist || 'Unknown Artist',
        album: album || 'Unknown Album',
        image: coverBuffer || undefined
    }, filePath);

    // ---------- SUCCESS ----------
    await sock.sendMessage(chatId, {
        react: { text: "✅", key: message.key }
    });

    await sock.sendMessage(chatId, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: `${title || 'audio'}.mp3`
    }, { quoted: message });

    fs.unlinkSync(filePath);

} catch (err) {
    console.error(err);

    await sock.sendMessage(chatId, {
        react: { text: "❌", key: message.key }
    });

    await sock.sendMessage(chatId, {
        text: `❌ Error:\n${err.message}`
    }, { quoted: message });
}

}

module.exports = renameCommand;
