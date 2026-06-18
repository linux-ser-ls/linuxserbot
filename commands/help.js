const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function helpCommand(sock, chatId, message) {
    // ⏳ Loading Reaction
    await sock.sendMessage(chatId, {
        react: { text: '📃', key: message.key }
    });

    // --- Fixed Indian Date & Time Logic ---
const now = new Date();

const istTime = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const time = istTime
    .replace('am', 'ᴀᴍ')
    .replace('pm', 'ᴩᴍ');
            
    const date = now.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');

    // Get IST hours for the greeting logic
    const istHours = parseInt(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }));

    function runtime() {
    const t = Date.now() - global.startTime;

    const totalSeconds = Math.floor(t / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } 
    
    const pushName = message.pushName || 'User';

    const helpMessage = `╭───❮ *𝐋ɪɴᴜx-𝐒ᴇʀ* ❯
│ *ᴛɪᴍᴇ* :   ${time}
│ *ᴅᴀᴛᴇ* :  ${date}
│ *ᴏᴡɴᴇʀ* :  ${settings.ownerName || '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓'}
│ *ᴜꜱᴇʀ* :  ${pushName}
│ *ᴘʀᴇғɪx* : .
│ *ᴘʟᴜɢɪɴꜱ* : 178
│ *ʀᴜɴᴛɪᴍᴇ* : ${runtime()}
╰─────────────⦁
╭───❮ *ɢᴇɴᴇʀᴀʟ* ❯
│  ᴍᴇɴᴜ
│  ᴩɪɴɢ
│  ᴀʟɪᴠᴇ
│  ᴏᴡɴᴇʀ
│  ʀᴜɴᴛɪᴍᴇ
│  ɴᴇᴡꜱ
│  8ʙᴀʟʟ
╰─────────────⦁
╭───❮ *ᴀᴅᴍɪɴ* ❯
│  ʙᴀɴ
│  ᴩʀᴏᴍᴏᴛᴇ
│  ᴅᴇᴍᴏᴛᴇ
│  ᴀᴅᴍɪɴꜱ
│  ᴍᴜᴛᴇ
│  ᴜɴᴍᴜᴛᴇ
│  ᴅᴇʟᴇᴛᴇ
│  ᴋɪᴄᴋ
│  ᴡᴀʀɴ
│  ᴀɴᴛɪʟɪɴᴋ
│  ᴀɴᴛɪᴛᴀɢ
│  ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ
│  ᴄʟᴇᴀʀ
│  ᴊɪᴅ
│  ᴛᴀɢ
│  ᴛᴀɢᴀʟʟ
│  ᴛᴀɢɴᴏᴛᴀᴅᴍɪɴ
│  ʜɪᴅᴇᴛᴀɢ
│  ᴄʜᴀᴛʙᴏᴛ
│  ʀᴇꜱᴇᴛʟɪɴᴋ
│  ᴡᴇʟᴄᴏᴍᴇ
│  ɢᴏᴏᴅʙʏᴇ
│  ꜱᴇᴛɢᴩᴩ
│  ꜱᴇᴛɢɴᴀᴍᴇ
│  ꜱᴇᴛɢᴅᴇꜱᴄ
│  ɢʀᴏᴜᴩɪɴꜰᴏ
╰─────────────⦁
╭───❮ *ᴏᴡɴᴇʀ* ❯
│  ᴍᴏᴅᴇ
│  ᴄʟᴇᴀʀꜱᴇꜱꜱɪᴏɴ
│  ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
│  ᴀɴᴛɪᴄᴀʟʟ
│  ᴄʟᴇᴀʀᴛᴍᴩ
│  ꜱᴜᴅᴏ
│  ᴜᴩᴅᴀᴛᴇ
│  ꜱᴇᴛᴛɪɴɢꜱ
│  ꜱᴇᴛᴩᴩ
│  ᴀᴜᴛᴏʀᴇᴀᴄᴛ
│  ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ
│  ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ ʀᴇᴀᴄᴛ
│  ᴀᴜᴛᴏᴛʏᴩɪɴɢ
│  ᴀᴜᴛᴏʀᴇᴀᴅ
│  ᴩᴍʙʟᴏᴄᴋᴇʀ
│  ᴩᴍʙʟᴏᴄᴋᴇʀ ꜱᴇᴛᴍꜱɢ
│  ꜱᴇᴛᴍᴇɴᴛɪᴏɴ
│  ᴍᴇɴᴛɪᴏɴ
╰─────────────⦁
╭───❮ *ɪᴍᴀɢᴇ/ꜱᴛɪᴄᴋᴇʀ* ❯
│  ʙʟᴜʀ
│  ꜱɪᴍᴀɢᴇ
│  ꜱᴛɪᴄᴋᴇʀ
│  ʀᴇᴍᴏᴠᴇʙɢ
│  ʀᴇᴍɪɴɪ
│  ᴄʀᴏᴩ
│  ᴛɢꜱᴛɪᴄᴋᴇʀ
│  ᴛᴀᴋᴇ
│  ᴇᴍɪx
│  ɪɢꜱ
│  ɪɢꜱᴄ
╰─────────────⦁
╭───❮ *ᴄᴏɴᴠᴇʀᴛᴇʀ* ❯
│  ᴛᴛꜱ
│  ᴀᴛᴛᴩ
│  ᴜʀʟ
│  ᴛᴏᴠᴏɪᴄᴇ
│  ᴛᴏᴍᴩ3
│  ᴄᴜᴛ
│  ʙᴀꜱꜱ
│  ꜱʟᴏᴡᴇᴅ
│  ʀᴇɴᴀᴍᴇ
╰─────────────⦁
╭───❮ *ɢᴀᴍᴇ* ❯
│  ᴛɪᴄᴛᴀᴄᴛᴏᴇ
│  ʜᴀɴɢᴍᴀɴ
│  ɢᴜᴇꜱꜱ
│  ᴛʀɪᴠɪᴀ
│  ᴀɴꜱᴡᴇʀ
│  qᴜɪᴢ
│  qᴜɪᴢᴀɴꜱᴡᴇʀ
│  ᴛʀᴜᴛʜ
│  ᴅᴀʀᴇ
╰─────────────⦁
╭───❮ *ᴀɪ* ❯
│  ɢᴩᴛ
│  ɢᴇᴍɪɴɪ
│  ɪᴍᴀɢɪɴᴇ
│  ꜰʟᴜx
│  ꜱᴏʀᴀ
╰─────────────⦁
╭───❮ *ꜰᴜɴ* ❯
│  ꜱʜɪᴘ
│  ʟᴏᴠᴇ
│  ᴛᴇᴅᴅʏ
│  ᴍᴏᴏɴ
│  ᴄʜᴀʀᴀᴄᴛᴇʀ
│  ᴡᴀꜱᴛᴇᴅ
│  ᴊᴏᴋᴇ
│  ᴍᴇᴍᴇ
│  ꜰᴀᴄᴛ
│  ϙᴜᴏᴛᴇ
│  ᴄᴏᴍᴩʟɪᴍᴇɴᴛ
│  ɪɴꜱᴜʟᴛ
│  ꜰʟɪʀᴛ
│  ʀᴇᴀᴅᴍᴏʀᴇ
│  ꜱʜᴀʏᴀʀɪ
│  ɢᴏᴏᴅᴍᴏʀɴɪɴɢ
│  ɢᴏᴏᴅɴɪɢʜᴛ
│  ʀᴏꜱᴇᴅᴀʏ
│  ꜱɪᴍᴩ
│  ꜱᴛᴜᴩɪᴅ
╰─────────────⦁
╭───❮ *ᴛᴇꜱᴛᴍᴀᴋᴇʀ* ❯
│  ᴍᴇᴛᴀʟʟɪᴄ
│  ɪᴄᴇ
│  ꜱɴᴏᴡ
│  ɪᴍᴩʀᴇꜱꜱɪᴠᴇ
│  ᴍᴀᴛʀɪx
│  ʟɪɢʜᴛ
│  ɴᴇᴏɴ
│  ᴅᴇᴠɪʟ
│  ᴩᴜʀᴩʟᴇ
│  ᴛʜᴜɴᴅᴇʀ
│  ʟᴇᴀᴠᴇꜱ
│  1917
│  ᴀʀᴇɴᴀ
│  ʜᴀᴄᴋᴇʀ
│  ꜱᴀɴᴅ
│  ʙʟᴀᴄᴋᴩɪɴᴋ
│  ɢʟɪᴛᴄʜ
│  ꜰɪʀᴇ
╰─────────────⦁
╭───❮ *ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* ❯
│  ᴩʟᴀʏ
│  ꜱᴏɴɢ
│  ꜱᴩᴏᴛɪꜰʏ
│  ɪᴍɢ
│  ɪɴꜱᴛᴀɢʀᴀᴍ
│  ꜰᴀᴄᴇʙᴏᴏᴋ
│  ᴛɪᴋᴛᴏᴋ
│  ᴠɪᴅᴇᴏ
│  ʏᴛᴍᴩ4
╰─────────────⦁
╭───❮ *ᴛᴏᴏʟꜱ* ❯
│  ꜰɪɴᴅ
│  ᴄᴀʟᴄ
│  ᴡᴇᴀᴛʜᴇʀ
│  ʙɪʀᴛʜ
│  qʀᴄᴏᴅᴇ
│  ʀᴇᴀᴅqʀ
│  ʟʏʀɪᴄꜱ
│  ᴛʀᴛ
│  ᴠᴠ
│  ꜱꜱ
╰─────────────⦁
╭───❮ *ᴀᴇꜱᴛʜᴇᴛɪᴄ* ❯
│  ᴀᴇꜱᴛʜᴇᴛɪᴄ
│  ʙɪᴏ
│  ɪɴꜱᴛᴀʙɪᴏ
│  ᴄᴀᴘᴛɪᴏɴ
│  ɴɪᴄᴋɴᴀᴍᴇ
│  ᴜꜱᴇʀɴᴀᴍᴇ
│  ꜱʏᴍʙᴏʟ
╰─────────────⦁
╭───❮ *ᴍɪꜱᴄ* ❯
│  ʜᴇᴀʀᴛ
│  ʜᴏʀɴʏ
│  ᴄɪʀᴄʟᴇ
│  ʟɢʙᴛ
│  ʟᴏʟɪᴄᴇ
│  ɪᴛꜱ-ꜱᴏ-ꜱᴛᴜᴩɪᴅ
│  ɴᴀᴍᴇᴄᴀʀᴅ
│  ᴏᴏɢᴡᴀʏ
│  ᴛᴡᴇᴇᴛ
│  ʏᴛᴄᴏᴍᴍᴇɴᴛ
│  ᴄᴏᴍʀᴀᴅᴇ
│  ɢᴀʏ
│  ɢʟᴀꜱꜱ
│  ᴊᴀɪʟ
│  ᴩᴀꜱꜱᴇᴅ
│  ᴛʀɪɢɢᴇʀᴇᴅ
╰─────────────⦁
╭───❮ *ᴀɴɪᴍᴇ* ❯
│  ɴᴏᴍ
│  ᴩᴏᴋᴇ
│  ᴄʀʏ
│  ᴋɪꜱꜱ
│  ᴩᴀᴛ
│  ʜᴜɢ
│  ᴡɪɴᴋ
│  ꜰᴀᴄᴇᴩᴀʟᴍ
╰─────────────⦁
╭───❮ *ɢɪᴛʜᴜʙ* ❯
│  ɢɪᴛ
│  ɢɪᴛʜᴜʙ
│  ꜱᴄ
│  ꜱᴄʀɪᴩᴛ
│  ʀᴇᴩᴏ
╰─────────────⦁
╭───❮ 𝐋ɪɴᴜx ꜱᴇʀ 🙂‍↔️🤎 ❯
│ ⚡ ᴄʀᴇᴀᴛᴇᴅ ʙʏ 
│             𝐋ɪɴᴜx ꜱᴇʀ 🧃🕊️
╰─────────────⦁
`;

    try {

        const imagePath = path.join(
            __dirname,
            '../assets/bot_image.jpg'
        );

        const mp3Path = path.join(
            __dirname,
            '../assets/menu.mp3'
        );

        const oggPath = path.join(
            __dirname,
            '../assets/menu.ogg'
        );

        // =========================
        // SEND MENU FIRST
        // =========================

        if (fs.existsSync(imagePath)) {

            await sock.sendMessage(chatId, {

                image:
                fs.readFileSync(imagePath),

                caption: helpMessage,

                mentions: [
                    message.key.participant ||
                    message.key.remoteJid
                ]

            }, { quoted: message });

        } else {

            await sock.sendMessage(chatId, {

                text: helpMessage

            }, { quoted: message });

        }

        // =========================
        // CONVERT MP3 TO REAL
        // WHATSAPP OPUS
        // =========================

        if (fs.existsSync(mp3Path)) {

            // Delete old ogg
            if (fs.existsSync(oggPath)) {

                fs.unlinkSync(oggPath);

            }

            // Convert properly
            execSync(

`ffmpeg -y -i "${mp3Path}" \
-map 0:a \
-c:a libopus \
-b:a 128k \
-vbr on \
-compression_level 10 \
-application voip \
-frame_duration 20 \
-ar 48000 \
-ac 1 \
"${oggPath}"`

            );

            // Small delay
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

            // =========================
            // SEND PLAYABLE VOICE
            // =========================

            await sock.sendMessage(chatId, {

                audio: {
                    url: oggPath
                },

                mimetype:
                'audio/ogg; codecs=opus',

                ptt: true

            }, { quoted: message });

        }

    } catch (error) {

        console.log(
            'Help Command Error:',
            error
        );

        await sock.sendMessage(chatId, {

            text:
            '❌ Error sending menu voice.'

        }, { quoted: message });

    }

}

module.exports = helpCommand;
