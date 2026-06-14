const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn, getGoodbye } = require('../lib/index');

async function goodbyeCommand(sock, chatId, message, match) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, {
            text: '❌ This command can only be used in groups.'
        });
        return;
    }

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';

    const matchText = text.split(' ').slice(1).join(' ').trim();

    if (!matchText) {
        return await sock.sendMessage(chatId, {
            text: `📤 *Goodbye Message Setup*

✅ *.goodbye on* — Enable goodbye messages
🛠️ *.goodbye set Your custom message* — Set a custom goodbye message
🚫 *.goodbye off* — Disable goodbye messages

━━━━━━━━━━━━━━━

📌 *Available Variables*

• {user} - Mentions the leaving member 👤
• {group} - Shows group name 👥

━━━━━━━━━━━━━━━

✨ *Example:*

.goodbye set 👋 Goodbye {user}

🏡 Group: {group}

😢 We will miss you!`
        });
    }

    await handleGoodbye(sock, chatId, message, matchText);
}

async function handleLeaveEvent(sock, id, participants) {
    const isGoodbyeEnabled = await isGoodByeOn(id);
    if (!isGoodbyeEnabled) return;

    const customMessage = await getGoodbye(id);

    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    for (const participant of participants) {
        try {
            const participantString =
                typeof participant === 'string'
                    ? participant
                    : (participant.id || participant.toString());

            const user = participantString.split('@')[0];

            let displayName = user;

            try {
                const groupParticipants = groupMetadata.participants || [];
                const userParticipant = groupParticipants.find(
                    p => p.id === participantString
                );

                if (userParticipant?.name) {
                    displayName = userParticipant.name;
                }
            } catch (e) {
                console.log('Could not fetch display name');
            }

            let finalMessage;

            if (customMessage) {
                finalMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName);
            } else {
                finalMessage = `╭━━━〔 👋 Goodbye 👋 〕━━━╮
┃ 👤 User : @${user}
┃ 👥 Group : ${groupName}
╰━━━━━━━━━━━━━━━╯

😢 Goodbye @${user}

🌸 Thanks for being part of *${groupName}*`;
            }

            await sock.sendMessage(id, {
             text: finalMessage,
             mentions: [participantString]
        });

        } catch (error) {
            console.error('Error sending goodbye message:', error);

            const participantString =
                typeof participant === 'string'
                    ? participant
                    : (participant.id || participant.toString());

            const user = participantString.split('@')[0];

            await sock.sendMessage(id, {
                text: `👋 Goodbye @${user}!`,
                mentions: [participantString]
            });
        }
    }
}

module.exports = {
    goodbyeCommand,
    handleLeaveEvent
};
