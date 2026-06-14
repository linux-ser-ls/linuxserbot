async function goodnightCommand(sock, chatId, message) {
    try {
        const messages = [
`🌙✨ Good Night

May your dreams be soft,
your heart be peaceful,
and your tomorrow be brighter than today. ☁️🤍

Sleep well and take care. 🌷

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🌌🫧 Good Night

The stars are shining,
the moon is watching,
and it's time to rest your mind. 🌙

Wishing you a peaceful night and beautiful dreams. 🤍✨

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`☁️🌙 Good Night

Leave your worries behind,
close your eyes,
and let the night heal your soul. 🕊️

Sweet dreams and restful sleep. 💫🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🪐✨ Good Night

May the moonlight guide your dreams,
and the stars fill your night with peace. 🌌

Sleep comfortably and wake up smiling. 🤍🌷

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🌙🤍 Good Night

Another day has ended,
another beautiful tomorrow awaits.

Rest your mind,
relax your heart,
and enjoy a peaceful sleep. ☁️✨

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`💫🌷 Good Night

The night is calm,
the sky is beautiful,
and your bed is waiting. 🌙

Have a cozy sleep and lovely dreams. 🤍🫧

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`☾⋆｡𖦹 °✩ Good Night

May your dreams be filled
with happiness, peace,
and countless little stars. ✨🌌

Sleep tight. 🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        await sock.sendMessage(
            chatId,
            { text: randomMessage },
            { quoted: message }
        );

    } catch (error) {
        console.error('Goodnight Command Error:', error);

        await sock.sendMessage(
            chatId,
            { text: '🌙 Good Night 🤍' },
            { quoted: message }
        );
    }
}

module.exports = { goodnightCommand };
