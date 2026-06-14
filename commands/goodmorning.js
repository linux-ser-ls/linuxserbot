async function goodmorningCommand(sock, chatId, message) {
    try {
        const messages = [
`🌤️✨ Good Morning

A new day has arrived,
bringing fresh opportunities
and beautiful moments. ☁️🤍

Have a wonderful day ahead. 🌷

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`☀️🫧 Good Morning

Wake up with a smile,
embrace the sunshine,
and let positivity guide your day. 🌼✨

Wishing you happiness and success. 🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🌅🤍 Good Morning

May your coffee be warm,
your heart be light,
and your day be amazing. ☕✨

Enjoy every moment. 🌷

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`☀️🌸 Good Morning

The sun is shining,
the birds are singing,
and a beautiful day awaits you. 🕊️✨

Have a peaceful and joyful morning. 🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🌤️💫 Good Morning

Leave yesterday behind,
focus on today,
and move forward with confidence. ☁️🌷

Wishing you a productive day. 🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`☕🌅 Good Morning

A fresh morning,
a fresh start,
and endless possibilities ahead. ✨

May your day be filled with smiles. 🤍🫧

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🌞☁️ Good Morning

Rise and shine.
The world is waiting
for your positive energy today. 🌷✨

Have a beautiful day ahead. 🤍

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`,

`🪴☀️ Good Morning

Take a deep breath,
appreciate this new day,
and make the most of every moment. 🌤️🤍

Wishing you peace and happiness. 🌸

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
        ];

        const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];

        await sock.sendMessage(
            chatId,
            { text: randomMessage },
            { quoted: message }
        );

    } catch (error) {
        console.error('GoodMorning Command Error:', error);

        await sock.sendMessage(
            chatId,
            { text: '☀️ Good Morning 🤍' },
            { quoted: message }
        );
    }
}

module.exports = { goodmorningCommand };
