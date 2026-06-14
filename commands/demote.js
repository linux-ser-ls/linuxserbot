const isAdmin = require('../lib/isAdmin');

// ======================
// MEMORY
// ======================

const recentDemotions = new Set();

// ======================
// DEMOTE COMMAND
// ======================

async function demoteCommand(
    sock,
    chatId,
    mentionedJids,
    message
) {
    try {

        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: `_❌ This command only works inside WhatsApp groups_`
            });
        }

        // ======================
        // ADMIN CHECK
        // ======================

        const adminStatus = await isAdmin(
            sock,
            chatId,
            message.key.participant || message.key.remoteJid
        );

        if (!adminStatus.isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: `_🤖 Please make bot admin to use this command_`
            });
        }

        if (!adminStatus.isSenderAdmin) {
            return await sock.sendMessage(chatId, {
                text: `_🚫 Only group admins can use .demote_`
            });
        }

        // ======================
        // GET USER
        // ======================

        let userToDemote = [];

        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        } else if (
            message.message?.extendedTextMessage?.contextInfo?.participant
        ) {
            userToDemote = [
                message.message.extendedTextMessage.contextInfo.participant
            ];
        }

        // ======================
        // NO USER
        // ======================

        if (userToDemote.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `
*👑 Demote User*

_👤 Mention a user or reply to their message_

_📌 Usage: .demote @user_
                `.trim()
            }, { quoted: message });
        }

        // ======================
        // REACTION
        // ======================

        await sock.sendMessage(chatId, {
            react: {
                text: '⬇️',
                key: message.key
            }
        });

        // ======================
        // SAVE TEMP
        // ======================

        userToDemote.forEach(jid => {
            recentDemotions.add(jid);

            setTimeout(() => {
                recentDemotions.delete(jid);
            }, 5000);
        });

        // ======================
        // DEMOTE
        // ======================

        await sock.groupParticipantsUpdate(
            chatId,
            userToDemote,
            "demote"
        );

        // ======================
        // FORMAT USERS
        // ======================

        const usernames = userToDemote.map(jid => `@${jid.split('@')[0]}`);

        // ======================
        // DEMOTER NAME FIX (IMPORTANT)
        // ======================

        const demoterJid =
            message.key.participant || message.key.remoteJid;

        const demoterName =
            message.pushName || demoterJid.split('@')[0];

        // ======================
        // MESSAGE
        // ======================

        const demotionMessage = `
✅ *Successfully Demoted*

👤 *_Demoted User:_* _${usernames.join(', ')}_

🛡️ *_Demoted By:_* _${demoterName}_
`.trim();

        await sock.sendMessage(chatId, {
            text: demotionMessage,
            mentions: [...userToDemote, demoterJid]
        });

    } catch (error) {
        console.log(error);

        await sock.sendMessage(chatId, {
            text: '_❌ Failed to demote user_'
        });
    }
}

// ======================
// EVENT DETECTION
// ======================

async function handleDemotionEvent(
    sock,
    groupId,
    participants,
    author
) {
    try {

        if (!Array.isArray(participants)) return;

        const filtered = participants.filter(
            jid => !recentDemotions.has(jid)
        );

        if (filtered.length === 0) return;

        const users = filtered.map(jid => `@${jid.split('@')[0]}`);

        let mentionList = [...filtered];

        let demotedBy = 'System';

        if (author) {
            demotedBy = `@${author.split('@')[0]}`;
            mentionList.push(author);
        }

        const detectMessage = `
✅ *Successfully Demoted*

👤 *_Demoted User:_* _${users.join(', ')}_

🛡️ *_Demoted By:_* _${demotedBy}_
`.trim();

        await sock.sendMessage(groupId, {
            text: detectMessage,
            mentions: mentionList
        });

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    demoteCommand,
    handleDemotionEvent
};
