const fs = require('fs');
const path = require('path');
const axios = require('axios');
const NodeID3 = require('node-id3');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// ---------------- Helpers ----------------
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
        timeout: 20000
    });
    return Buffer.from(res.data);
}

async function downloadWA(message, type = 'audio') {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
}

// ---------------- Usage ----------------
const usage = `🎧 *Rename Command Usage*

.reply to audio/document OR use URL

🧾 Format:
.rename title, artist, album, cover_url

📌 Example:
.rename Starboy, The Weeknd, Starboy Album, https://i.imgur.com/cover.jpg`;


// ---------------- Main ----------------
async function renameCommand(sock, chatId, message, text = '') {
try {

    // ALWAYS REACT START (so user knows bot is alive)
    await sock.sendMessage(chatId, {
        react: { text: "🎧", key: message.key }
    });

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const { title, artist, album, cover } = parseArgs(text);

    let buffer = null;

    // ---------------- SAFE INPUT DETECTION ----------------

    try {
        // CASE 1: URL INPUT (first argument only)
        const firstArg = text.split(',')[0]?.trim();

        if (firstArg && isUrl(firstArg)) {
            buffer = await downloadUrlBuffer(firstArg);
        }

        // CASE 2: WhatsApp audio reply
        else if (message.message?.audioMessage || quoted?.audioMessage) {
            buffer = await downloadWA(
                message.message?.audioMessage || quoted?.audioMessage,
                'audio'
            );
        }

        // CASE 3: WhatsApp document reply
        else if (message.message?.documentMessage || quoted?.documentMessage) {
            buffer = await downloadWA(
                message.message?.documentMessage || quoted?.documentMessage,
                'document'
            );
        }

    } catch (e) {
        console.log("Media detection error:", e.message);
    }

    // ---------------- NO MEDIA FOUND ----------------
    if (!buffer) {
        await sock.sendMessage(chatId, {
            react: { text: "❌", key: message.key }
        });

        return sock.sendMessage(chatId, {
            text: usage
        }, { quoted: message });
    }

    // ---------------- PROCESS ----------------
    const filePath = path.join('./temp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, buffer);

    // ---------------- COVER ----------------
    let coverBuffer = null;

    if (cover && isUrl(cover)) {
        try {
            const res = await axios.get(cover, {
                responseType: 'arraybuffer'
            });
            coverBuffer = Buffer.from(res.data);
        } catch (e) {
            console.log("Cover error ignored");
        }
    }

    // ---------------- TAG ----------------
    NodeID3.write({
        title,
        artist,
        album,
        image: coverBuffer || undefined
    }, filePath);

    // ---------------- SUCCESS ----------------
    await sock.sendMessage(chatId, {
        react: { text: "✅", key: message.key }
    });

    await sock.sendMessage(chatId, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
    }, { quoted: message });

    fs.unlinkSync(filePath);

} catch (err) {

    console.error("Rename Error:", err);

    await sock.sendMessage(chatId, {
        react: { text: "❌", key: message.key }
    });

    return sock.sendMessage(chatId, {
        text: `❌ Error:\n${err.message}`
    }, { quoted: message });

}

}

module.exports = renameCommand;
