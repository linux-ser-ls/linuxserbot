const nicknames = [

"MoonChild 🌙",
"SilentSoul 🤍",
"DarkNova 🖤",
"DreamWalker ☁️",
"FrostByte ❄️",
"ShadowX 🕶️",
"SkyWhisper ☁️",
"NightBloom 🌙",
"StarDust ✨",
"GhostVibe 👻",
"CloudyMind ☁️",
"OceanEyes 🌊",
"VelvetSoul 🦋",
"LunarBoy 🌙",
"PixelKing 👑",
"StormHeart ⚡",
"WildSpirit 🦅",
"NeonSoul 💜",
"CosmicDream 🪐",
"MysticVibe ✨",
"VoidWalker 🌌",
"CrystalMoon 🌙",
"GoldenAura ✨",
"SilentWolf 🐺",
"SnowFlake ❄️"

];

async function nicknameCommand(sock, chatId, message) {
try {
const randomNickname =
nicknames[
Math.floor(
Math.random() * nicknames.length
)
];

    await sock.sendMessage(
        chatId,
        {
            text: `🎭 Random Nickname

✨ ${randomNickname}

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
},
{ quoted: message }
);

} catch (err) {
    console.error('Nickname Error:', err);

    await sock.sendMessage(
        chatId,
        {
            text: `🎭 Random Nickname

✨ MoonChild 🌙

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
},
{ quoted: message }
);
}
}

module.exports = nicknameCommand;
