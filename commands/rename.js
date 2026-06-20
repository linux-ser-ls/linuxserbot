const fs = require('fs');
const path = require('path');
const axios = require('axios');
const NodeID3 = require('node-id3');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ---------- Helpers ----------
function parseArgs(text = '') {
    const parts = text.split(',').map(v => v.trim());

    return {
        title: parts[0] || 'Unknown Title',
        artist: parts[1] || 'Unknown Artist',
        album: parts[2] || 'Unknown Album',
        cover: parts[3] || null
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

// ---------- Main Command ----------
async function renameCommand(sock, chatId, message, text = '') {
try {

    await sock.sendMessage(chatId, { react: { text: "🎧", key: message.key } });

    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    }

    const { title, artist, album, cover } = parseArgs(text);

    let buffer;
    let fileName = `${Date.now()}.mp3`;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const msg = message.message;

    let mediaMsg = null;
    let mediaType = null;

    // ---------- URL DETECTION (SAFE) ----------
    const firstArg = text.split(',')[0]?.trim();

    if (firstArg && isUrl(firstArg)) {
        buffer = await downloadUrlBuffer(firstArg);
        mediaType = 'url';
    }

    // ---------- WhatsApp Audio ----------
    else if (msg?.audioMessage || quoted?.audioMessage) {
        mediaMsg = msg?.audioMessage || quoted?.audioMessage;
        buffer = await downloadWhatsAppMedia(mediaMsg, 'audio');
        mediaType = 'audio';
    }

    // ---------- WhatsApp Document ----------
    else if (msg?.documentMessage || quoted?.documentMessage) {
        mediaMsg = msg?.documentMessage || quoted?.documentMessage;
        buffer = await downloadWhatsAppMedia(mediaMsg, 'document');
        mediaType = 'document';
    }

    else {
        await sock.sendMessage(chatId, { react: { text: "❌", key: message.key } });

        return sock.sendMessage(chatId, {
            text: `🎧 *Rename Command Usage*

.reply to audio/document OR use URL

🧾 Format:
.rename title, artist, album, cover_url

📌 Example:
.rename Starboy, The Weeknd, Starboy Album, https://i.imgur.com/cover.jpg

⚡ You can also use:
• Reply to WhatsApp audio
• Reply to document file
• Direct audio URL (mp3 links)

🎨 Cover image is optional (URL only)`
        }, { quoted: message });
    }

    // ---------- Processing ----------
    const status = await sock.sendMessage(chatId, {
        text: '🎧 Processing media...'
    }, { quoted: message });

    // ---------- Save ----------
    const filePath = path.join('./temp', fileName);
    fs.writeFileSync(filePath, buffer);

    // ---------- Cover ----------
    let coverBuffer = null;

    if (cover && isUrl(cover)) {
        try {
            const res = await axios.get(cover, { responseType: 'arraybuffer' });
            coverBuffer = Buffer.from(res.data);
        } catch {
            console.log('⚠️ Cover load failed');
        }
    }

    // ---------- ID3 ----------
    NodeID3.write({
        title,
        artist,
        album,
        image: coverBuffer || undefined
    }, filePath);

    // ---------- Success ----------
    await sock.sendMessage(chatId, {
        react: { text: "✅", key: message.key }
    });

    await sock.sendMessage(chatId, {
        text: '🎉 Renamed & tagged successfully!',
        edit: status.key
    });

    await sock.sendMessage(chatId, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
    }, { quoted: message });

    fs.unlinkSync(filePath);

} catch (err) {
    console.error('Rename Error:', err);

    await sock.sendMessage(chatId, {
        react: { text: "❌", key: message.key }
    });

    await sock.sendMessage(chatId, {
        text: `❌ Error:\n${err.message}`
    }, { quoted: message });
}

}

module.exports = renameCommand;
