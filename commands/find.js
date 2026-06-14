const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const config = require('../config');

// ---------------- SAVE ----------------
function saveBuffer(filePath, buffer) {
    fs.writeFileSync(filePath, buffer);
}

// ---------------- EXTRACT AUDIO ----------------
function extractAudio(input, output) {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${input}" -vn -acodec mp3 "${output}"`, (err) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
}

// ---------------- AUDD ENGINE ----------------
async function detectSong(audioBuffer) {
    try {
        const res = await fetch('https://api.audd.io/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_token: config.AUDD_KEY,
                audio: audioBuffer.toString('base64')
            })
        });

        const json = await res.json();
        if (!json.result) return null;

        return {
            title: json.result.title,
            artist: json.result.artist,
            album: json.result.album || 'Unknown'
        };

    } catch {
        return null;
    }
}

// ---------------- GET REPLIED MEDIA ----------------
async function getRepliedMedia(message) {
    try {
        const msg = message.message;

        const quoted =
            msg?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) return null;

        let stream;

        if (quoted.audioMessage) {
            stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
        }
        else if (quoted.voiceMessage) {
            stream = await downloadContentFromMessage(quoted.voiceMessage, 'audio');
        }
        else if (quoted.videoMessage) {
            stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        }
        else {
            return null;
        }

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        return buffer;

    } catch (e) {
        console.error('Media error:', e);
        return null;
    }
}

// ---------------- MAIN COMMAND ----------------
module.exports = async function findCommand(sock, chatId, message) {
    try {

        // ❤️ REACT ON COMMAND
        await sock.sendMessage(chatId, {
            react: {
                text: '🔍',
                key: message.key
            }
        });

        const buffer = await getRepliedMedia(message);

        if (!buffer) {
            return sock.sendMessage(chatId, {
                text: `
*🎧 Song Finder*

_🎵 Reply to an audio, voice, video_

_📌 Then type: .find_

_🌷 Detect songs instantly ✨_
`.trim()
            }, { quoted: message });
        }

        const inputPath = path.join(__dirname, 'input_media');
        const outputPath = path.join(__dirname, 'audio.mp3');

        saveBuffer(inputPath, buffer);

        let file = inputPath;

        const isVideo = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

        if (isVideo) {
            await extractAudio(inputPath, outputPath);
            file = outputPath;
        }

        const audioBuffer = fs.readFileSync(file);

        const result = await detectSong(audioBuffer);

        try {
            fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch {}

        if (!result) {
            return sock.sendMessage(chatId, {
                text: `
*🎧 Song Finder*

_❌ Unable to identify this audio_

_🎵 Try clearer sound or different clip_

_🌷 Tip: use short audio segments ✨_
`.trim()
            }, { quoted: message });
        }

        const text = `
*🎧 Song Identified*

*_🎶 Title :_* _${result.title}_
*_👤 Artist :_* _${result.artist}_
*_💿 Album :_* _${result.album || 'Unknown'}_

_🌷 Powered by 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️_
`.trim();
        await sock.sendMessage(chatId, { text }, { quoted: message });

    } catch (err) {
        console.error(err);
        sock.sendMessage(chatId, {
            text: '❌ Song detection failed'
        }, { quoted: message });
    }
};
