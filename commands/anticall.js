const fs = require('fs');

const ANTICALL_PATH = './data/anticall.json';

function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
        const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return { enabled: !!data.enabled };
    } catch {
        return { enabled: false };
    }
}

function writeState(enabled) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
    } catch {}
}

async function anticallCommand(sock, chatId, message, args) {
    const state = readState();
    const sub = (args || '').trim().toLowerCase();

    if (!sub || (sub !== 'on' && sub !== 'off' && sub !== 'status')) {
        // Usage Message
await sock.sendMessage(chatId, {
    text: `╭━━━〔 📞 ᴀɴᴛɪᴄᴀʟʟ 〕━━━╮
┃
┣ 🔹 ᴏɴ
┣ 🔹 ᴏꜰꜰ
┣ 📊 ꜱᴛᴀᴛᴜꜱ
┃
╰━━━━━━━━━━━━━━━╯

╭─❍「 📚 ᴜꜱᴀɢᴇ ɢᴜɪᴅᴇ 」
│
├ 🛠️ ᴄᴏᴍᴍᴀɴᴅ: .ᴀɴᴛɪᴄᴀʟʟ
│
├ 📖 ᴅᴇꜱᴄʀɪᴘᴛɪᴏɴ:
│   ᴍᴀɴᴀɢᴇ ᴀɴᴛɪᴄᴀʟʟ ꜱᴇᴛᴛɪɴɢꜱ
│
├ ⚡ ᴇxᴀᴍᴘʟᴇꜱ:
│   .ᴀɴᴛɪᴄᴀʟʟ ᴏɴ
│   .ᴀɴᴛɪᴄᴀʟʟ ᴏꜰꜰ
│   .ᴀɴᴛɪᴄᴀʟʟ ꜱᴛᴀᴛᴜꜱ
│
╰───────────────❍`
}, { quoted: message });
        return;
    }

    if (sub === 'status') {
    await sock.sendMessage(chatId, {
    text: `╭━━━〔 📊 ᴀɴᴛɪᴄᴀʟʟ ꜱᴛᴀᴛᴜꜱ 〕━━━╮
┃
┣ ⚡ ꜱᴛᴀᴛᴜꜱ :${state.enabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪꜱᴀʙʟᴇᴅ'}
┃
╰━━━━━━━━━━━━━━━━━━╯`
}, { quoted: message });
    return;
}

    const enable = sub === 'on';
    writeState(enable);
    const enable = sub === 'on';
writeState(enable);

await sock.sendMessage(chatId, {
text: enable
? `╭───❮ *ᴀɴᴛɪᴄᴀʟʟ* ❯
│
├ ✅ ᴇɴᴀʙʟᴇᴅ
│
├ 📞 ɪɴᴄᴏᴍɪɴɢ ᴄᴀʟʟꜱ
├ 🚫 ᴡɪʟʟ ʙᴇ ʙʟᴏᴄᴋᴇᴅ
│
╰─────────────⦁`
: `╭───❮ *ᴀɴᴛɪᴄᴀʟʟ* ❯
│
├ ❌ ᴅɪꜱᴀʙʟᴇᴅ
│
├ 📞 ɪɴᴄᴏᴍɪɴɢ ᴄᴀʟʟꜱ
├ 🔓 ᴀʀᴇ ɴᴏᴡ ᴀʟʟᴏᴡᴇᴅ
│
╰─────────────⦁`
}, { quoted: message });

}

module.exports = { anticallCommand, readState };


