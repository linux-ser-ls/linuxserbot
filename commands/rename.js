const fs = require('fs');
const path = require('path');
const axios = require('axios');
const NodeID3 = require('node-id3');
const {
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

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
    return /^https?:\/\//i.test(text);
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

    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    }

    // ---------- Parse metadata ----------
    const { title, artist, album, cover } = parseArgs(text);

    let buffer;
    let fileName = `${Date.now()}.mp3`;

    // ---------- Detect quoted message ----------
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg = quoted || message.message;

    let mediaMsg = null;
    let mediaType = null;

    // ---------- CASE 1: URL input ----------
    if (isUrl(text)) {
        buffer = await downloadUrlBuffer(text);
        mediaType = 'url';
    }

    // ---------- CASE 2: WhatsApp media ----------
    else if (msg?.audioMessage) {
        mediaMsg = msg.audioMessage;
        mediaType = 'audio';
        buffer = await downloadWhatsAppMedia(mediaMsg, 'audio');
    }

    else if (msg?.documentMessage) {
        mediaMsg = msg.documentMessage;
        mediaType = 'document';
        buffer = await downloadWhatsAppMedia(mediaMsg, 'document');
    }

    else {
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

    // ---------- Progress ----------
    const status = await sock.sendMessage(chatId, {
        text: '🎧 Processing media...'
    }, { quoted: message });

    // ---------- Save file ----------
    const filePath = path.join('./temp', fileName);
    fs.writeFileSync(filePath, buffer);

    // ---------- Cover image ----------
    let coverBuffer = null;

    if (cover && isUrl(cover)) {
        try {
            const res = await axios.get(cover, {
                responseType: 'arraybuffer'
            });
            coverBuffer = Buffer.from(res.data);
        } catch (e) {
            console.log('⚠️ Cover download failed, skipping...');
        }
    }

    // ---------- ID3 tagging ----------
    const tags = {
        title,
        artist,
        album,
        image: coverBuffer || undefined
    };

    NodeID3.write(tags, filePath);

    // ---------- Send result ----------
    await sock.sendMessage(chatId, {
        text: '✅ Renamed & tagged successfully!',
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
        text: `❌ Error:\n${err.message}`
    }, { quoted: message });
}

}

module.exports = renameCommand;
