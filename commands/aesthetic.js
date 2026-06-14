const aestheticMessages = [

`☁️✨

Lost in thoughts,
found in dreams.

🤍`,

`🌙🫧

Some people are poetry,
even when they stay silent.

☾`,

`🪐✨

Not every star shines loudly.

🤍`,

`☁️🌷

Soft heart.
Calm mind.
Peaceful soul.

✨`,

`🌙

Existing quietly,
loving deeply.

🤍🫧`,

`🕊️☁️

Healing is beautiful.

✨🌷`,

`🌊🤍

Flow like water.
Shine like stars.

✨`,

`🌙🪄

Dream big.
Stay humble.

☁️🤍`,

`✨🫧

Less perfection.
More authenticity.

🤍`,

`☾🌷

Beautiful things
take time.

✨`,

`🌸☁️

Peace begins
where expectations end.

🤍✨`,

`🌙💫

The moon knows
all the stories
the stars never tell.

🤍🫧`,

`🦋🌷

Grow through
what you go through.

☁️🤍`,

`🌊☁️

Be calm like the ocean,
not loud like the storm.

🤍✨`,

`🪐🌙

Stay rare.
Stay different.

🤍☄️`

];

async function aestheticCommand(sock, chatId, message) {
try {
const random =
aestheticMessages[
Math.floor(
Math.random() * aestheticMessages.length
)
];

    await sock.sendMessage(
        chatId,
        {
            text: `${random}

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
},
{ quoted: message }
);

} catch (err) {
    console.error('Aesthetic Command Error:', err);

    await sock.sendMessage(
        chatId,
        {
            text: `☁️✨

Stay aesthetic.
Stay unique.

🤍🌙

— 𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️`
},
{ quoted: message }
);
}
}

module.exports = aestheticCommand;
