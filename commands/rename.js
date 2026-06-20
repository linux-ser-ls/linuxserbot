const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function parseArgs(text) {
    const parts = text.split(',').map(v => v.trim());
    return {
        title: parts[0] || 'Unknown Title',
        artist: parts[1] || 'Unknown Artist',
        album: parts[2] || 'Unknown Album',
        cover: parts[3] || null
    };
}

async function getMediaBuffer(message, type = 'audio') {
    const stream = await downloadContentFromMessage(message, type);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

async function renameCommand(sock, chatId, message, text) {
try {

    if (!text) {
        return sock.sendMessage(chatId, {
            text: '❌ Usage: .rename title, artist, album, coverUrl'
        }, { quoted: message });
    }

    const { title, artist, album, cover } = parseArgs(text);

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg = quoted || message.message;

    let mediaType = null;
    let mediaMsg = null;

    // Detect audio or document
    if (msg?.audioMessage) {
        mediaType = 'audio';
        mediaMsg = msg.audioMessage;
    } 
    else if (msg?.documentMessage) {
        mediaType = 'document';
        mediaMsg = msg.documentMessage;
    }
    else {
        return sock.sendMessage(chatId, {
            text: '❌ Reply to an audio or document file.'
        }, { quoted: message });
    }

    const status = await sock.sendMessage(chatId, {
        text: '🎵 Processing file...'
    }, { quoted: message });

    // download media
    const buffer = await getMediaBuffer(mediaMsg, mediaType);

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    const filePath = `./temp/${Date.now()}.mp3`;
    fs.writeFileSync(filePath, buffer);

    // cover image buffer
    let coverBuffer = null;
    if (cover) {
        try {
            const res = await axios.get(cover, { responseType: 'arraybuffer' });
            coverBuffer = Buffer.from(res.data);
        } catch (e) {
            console.log('Cover load failed, ignoring...');
        }
    }

    // apply ID3 tags (only meaningful for audio)
    const tags = {
        title,
        artist,
        album,
        image: coverBuffer || undefined
    };

    NodeID3.write(tags, filePath);

    await sock.sendMessage(chatId, {
        text: '✅ File renamed & tagged successfully!',
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
