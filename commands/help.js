const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =========================
// COMMAND CATEGORIES (RAW)
// =========================
const commandCategories = {
  general: ["menu", "ping", "alive", "owner", "runtime", "news", "8ball"],
  admin: ["ban", "promote", "demote", "mute", "unmute", "kick"],
  owner: ["mode", "clearsession", "update", "settings", "sudo"],
  image: ["blur", "sticker", "crop", "emix", "igs", "igsc"],
  converter: ["tts", "attp", "url", "toaudio", "gif", "rename"],
  game: ["tictactoe", "hangman", "guess", "quiz", "truth", "dare"],
  ai: ["imagine", "flux"],
  fun: ["joke", "meme", "fact", "quote", "ship", "love"],
  downloader: ["play", "song", "instagram", "tiktok", "ytmp4"],
  tools: ["calc", "weather", "qrcode", "lyrics", "wiki"],
  github: ["git", "repo", "script"]
};

// =========================
// FONT STYLIZER
// =========================
function stylize(text) {
  const map = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ",
    f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ",
    k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ",
    p: "ᴘ", q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ",
    u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ"
  };

  return text
    .toLowerCase()
    .split("")
    .map(c => map[c] || c)
    .join("");
}

// =========================
// BUILD MENU
// =========================
function buildMenu() {
  let menu = "";

  for (const [cat, cmds] of Object.entries(commandCategories)) {
    menu += `╭───❮ *${stylize(cat)}* ❯\n`;

    cmds.forEach(cmd => {
      menu += `│  ${stylize(cmd)}\n`;
    });

    menu += `╰─────────────⦁\n`;
  }

  return menu;
}

// =========================
// HELP COMMAND
// =========================
async function helpCommand(sock, chatId, message) {

  await sock.sendMessage(chatId, {
    react: { text: "📃", key: message.key }
  });

  const now = new Date();

  const time = new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const date = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata"
  });

  const runtime = () => {
    const t = Date.now() - global.startTime;
    const s = Math.floor(t / 1000);

    return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  const pluginCount = Object.values(commandCategories)
    .reduce((a, b) => a + b.length, 0);

  const menu =
`╭───❮ 𝐋ɪɴᴜx-𝐒ᴇʀ ❯
│ *ᴛɪᴍᴇ* : ${time}
│ *ᴅᴀᴛᴇ* : ${date}
│ *ᴏᴡɴᴇʀ* : ${settings.ownerName || '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓'}
│ *ᴜꜱᴇʀ* : ${message.pushName || "User"}
│ *ᴘʟᴜɢɪɴꜱ* : ${pluginCount}
│ *ʀᴜɴᴛɪᴍᴇ* : ${runtime()}
╰─────────────⦁
${buildMenu()}
╭───❮ 𝐋ɪɴᴜx ꜱᴇʀ 🙂‍↔️🤎 ❯
│ ⚡ ᴄʀᴇᴀᴛᴇᴅ ʙʏ 
│            𝐋ɪɴᴜx ꜱᴇʀ 🧃🕊️
╰─────────────⦁`;

  const imagePath = path.join(__dirname, "../assets/bot_image.jpg");
  const mp3Path = path.join(__dirname, "../assets/menu.mp3");
  const oggPath = path.join(__dirname, "../assets/menu.ogg");

  // =========================
  // SEND MENU
  // =========================
  if (fs.existsSync(imagePath)) {
    await sock.sendMessage(chatId, {
      image: fs.readFileSync(imagePath),
      caption: menu
    }, { quoted: message });
  } else {
    await sock.sendMessage(chatId, {
      text: menu
    }, { quoted: message });
  }

  // =========================
  // AUDIO MENU
  // =========================
  try {
    if (fs.existsSync(mp3Path)) {

      if (fs.existsSync(oggPath)) {
        fs.unlinkSync(oggPath);
      }

      execSync(
        `ffmpeg -y -i "${mp3Path}" -map 0:a -c:a libopus -b:a 128k -vbr on -compression_level 10 -application voip -frame_duration 20 -ar 48000 -ac 1 "${oggPath}"`
      );

      await sock.sendMessage(chatId, {
        audio: { url: oggPath },
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      }, { quoted: message });
    }

  } catch (err) {
    console.log("Audio error:", err);
  }
}

module.exports = helpCommand;
