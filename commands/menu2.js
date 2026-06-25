const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =========================
// COMMAND CATEGORIES (RAW)
// =========================
const commandCategories = {
  general: [
    "menu", "menu2", "ping", "alive", "owner", "runtime", "news", "8ball"
  ],

  admin: [
    "ban", "promote", "demote", "admins", "mute", "unmute",
    "delete", "kick", "warn", "unwarn", "warnings",
    "antilink", "antitag", "antibadword", "clear", "jid",
    "tag", "tagall", "tagnotadmin", "hidetag", "link", "resetlink",
    "welcome", "goodbye", "setgpp", "setgname", "setgdesc", "groupinfo", "topmembers"
  ],

  owner: [
    "mode", "clearsession", "antidelete", "anticall", "cleartmp",
    "sudo", "update", "settings", "setpp",
    "autoreact", "autostatus", "autostatusreact", "autotyping", "autoread",
    "pmlocker", "pmlocker_setmsg", "setmention", "mention"
  ],

  image: [
    "blur", "simage", "sticker", "crop", "take",
    "emix", "igs", "igsc"
  ],

  converter: [
    "tts", "attp", "url", "tovoice", "tomp3",
    "gif", "cut", "bass", "slowed", "rename"
  ],

  game: [
    "tictactoe", "hangman", "guess", "trivia", 
    "answer", "quiz", "quizanswer", "truth", "dare"
  ],

  ai: [
    "imagine", "flux"
  ],

  fun: [
    "ship", "love", "teddy", "moon", "character",
    "wasted", "joke", "meme", "fact", "quote",
    "compliment", "insult", "flirt",
    "readmore", "shayari",
    "goodmorning", "goodnight",
    "roseday", "simp", "stupid"
  ],

  textmaker: [
    "metallic", "ice", "snow", "impressive", "matrix", "light",
    "neon", "devil", "purple", "thunder", "leaves", "1917",
    "arena", "hacker", "sand", "blackpink", "glitch", "fire"
    ],

  downloader: [
    "play", "song", "img",
    "instagram", "facebook", "tiktok",
    "video", "ytmp4"
  ],

  tools: [
    "find", "calc", "weather", "birth",
    "qrcode", "readqr", "lyrics", "wiki", "trt"
  ],

  aesthetic: [
    "aesthetic", "bio", "instabio",
    "caption", "nickname", "username", "symbol"
  ],

  misc: [
    "heart", "horny", "circle", "lgbt",
    "lolice", "its-so-stupid", "namecard",
    "oogway", "tweet", "ytcomment",
    "comrade", "gay", "glass",
    "jail", "passed", "triggered"
  ],

  anime: [
    "nom", "poke", "cry", "kiss",
    "pat", "hug", "wink", "facepalm"
  ],

  github: [
    "git", "github", "sc", "script", "repo"
  ]
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

        menu += `╭──────────────⊷\n`;
        menu += `│ 〔 ${stylize(cat)} 〕\n`;
        menu += `╰──────────────⊷\n`;
        menu += `    │\n`;
        menu += `╭⊣\n`;

        cmds.forEach(cmd => {
            menu += ` |   |    ○➛ ${stylize(cmd)}\n`;
        });

        menu += ` |  ╰────────────⋅⋅⋅⋅⊷\n`;
        menu += `╰──────────────⋅⋅⋅⋅⊷\n\n`;
    }

    return menu;
}

// =========================
// MENU2 COMMAND
// =========================
async function menu2Command(sock, chatId, message) {

  // NOTE: Menu text below stays unchanged. Only style/art will be replicated for new menu commands.

  await sock.sendMessage(chatId, {
    react: { text: "📜", key: message.key }
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

  const menu = `
╭───〔 𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓ 〕───╮
│✺╭───────────────
│✺│  ✦ 𝐓ɪᴍᴇ      : ${time}
│✺│  ✦ 𝐃ᴀᴛᴇ      : ${date}
│✺│  ✦ 𝐎ᴡɴᴇʀ     : ${settings.ownerName || '𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓'}
│✺│  ✦ 𝐔ꜱᴇʀ      : ${message.pushName || "​🇺​​🇸​​🇪​​🇷​"}
│✺│  ✦ 𝐏ʀᴇꜰɪx    : [ *.* ]
│✺│  ✦ 𝐏ʟᴜɢɪɴꜱ   : ${pluginCount}
│✺│  ✦ 𝐑ᴜɴᴛɪᴍᴇ   : ${runtime()}
│✺╰───────────────
╰───────────────────────╯

${buildMenu()}╭───〔 𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓ 〕───╮
│✇╭───────────────
│✇│ 𝐂ʀᴇᴀᴛᴇᴅ ʙʏ 
│✇│        𝐋ɪ፝֟፝ɴᴜꪎ 𝐒ᴇ𝚁 ⺓
│✇╰───────────────
╰─────────────────╯`;

  const imagePath = path.join(__dirname, "../assets/bot_image.jpg");
  const mp3Path = path.join(__dirname, "../assets/menu2.mp3");

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

module.exports = menu2Command;
