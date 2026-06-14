const { isAdmin } = require('../lib/isAdmin');

// ======================
// MEMORY
// ======================

const recentPromotions = new Set();

// ======================
// PROMOTE COMMAND
// ======================

async function promoteCommand(
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
        // GET USER
        // ======================

        let userToPromote = [];

        if (mentionedJids && mentionedJids.length > 0) {
            userToPromote = mentionedJids;
        } else if (
            message.message?.extendedTextMessage?.contextInfo?.participant
        ) {
            userToPromote = [
                message.message.extendedTextMessage.contextInfo.participant
            ];
        }

        if (userToPromote.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `
*👑 Promote User*

_👤 Mention a user or reply to their message_

_📌 Usage: .promote @user_
                `.trim()
            }, { quoted: message });
        }

        // ======================
        // REACTION
        // ======================

        await sock.sendMessage(chatId, {
            react: {
                text: '👑',
                key: message.key
            }
        });

        // ======================
        // TEMP STORE
        // ======================

        userToPromote.forEach(jid => {
            recentPromotions.add(jid);
            setTimeout(() => recentPromotions.delete(jid), 5000);
        });

        // ======================
        // PROMOTE
        // ======================

        await sock.groupParticipantsUpdate(
            chatId,
            userToPromote,
            "promote"
        );

        // ======================
        // FORMAT USERS (NO RAW ID)
        // ======================

        const usernames = userToPromote.map(jid => {
            return `@${jid.split('@')[0]}`;
        });

        // ======================
        // PROMOTER NAME FIX
        // ======================

        const promoterJid =
            message.key.participant || message.key.remoteJid;

        const promoterName =
            message.pushName || promoterJid.split('@')[0];

        // ======================
        // MESSAGE
        // ======================

        const promotionMessage = `
*👑 Successfully Promoted*

👤 *_New Admin:_* _${usernames.join(', ')}_

🛡️ *_Promoted By:_* _${promoterName}_
`.trim();

        await sock.sendMessage(chatId, {
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid]
        });

    } catch (error) {
        console.error(error);

        await sock.sendMessage(chatId, {
            text: '_❌ Failed to promote user_'
        });
    }
}

// ======================
// EVENT DETECTION
// ======================

async function handlePromotionEvent(
    sock,
    groupId,
    participants,
    author
) {
    try {

        if (!Array.isArray(participants)) return;

        const filtered = participants.filter(
            jid => !recentPromotions.has(jid)
        );

        if (filtered.length === 0) return;

        const promotedUsers = filtered.map(jid => `@${jid.split('@')[0]}`);

        let mentionList = [...filtered];

        let promotedBy = 'System';

        if (author) {
            promotedBy = `@${author.split('@')[0]}`;
            mentionList.push(author);
        }

        const promotionMessage = `
👑 *Promotion Detected*

👥 *_New Admin:_* _${promotedUsers.join(', ')}_

🛡️ *_Promoted By:_* _${promotedBy}_
`.trim();

        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions: mentionList
        });

    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    promoteCommand,
    handlePromotionEvent
};
