const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, '../data/warnings.json');

async function unwarnCommand(sock, chatId, senderId, mentionedJids, message) {
try {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ This command can only be used in groups.'
        });
    }

    const { isSenderAdmin, isBotAdmin } =
        await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ Please make me an admin first.'
        });
    }

    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ Only group admins can use this command.'
        });
    }

    let targetUser;

    if (mentionedJids && mentionedJids.length > 0) {
        targetUser = mentionedJids[0];
    } else if (
        message.message?.extendedTextMessage
            ?.contextInfo?.participant
    ) {
        targetUser =
            message.message.extendedTextMessage
                .contextInfo.participant;
    }

    if (!targetUser) {
        return await sock.sendMessage(chatId, {
            text: '❌ Mention or reply to a user.'
        });
    }

    let warnings = {};

    if (fs.existsSync(warningsPath)) {
        warnings = JSON.parse(
            fs.readFileSync(warningsPath, 'utf8')
        );
    }

    if (
        !warnings[chatId] ||
        !warnings[chatId][targetUser]
    ) {
        return await sock.sendMessage(chatId, {
            text: '⚠️ This user has no warnings.'
        });
    }

    warnings[chatId][targetUser]--;

    if (warnings[chatId][targetUser] <= 0) {
        delete warnings[chatId][targetUser];
    }

    fs.writeFileSync(
        warningsPath,
        JSON.stringify(warnings, null, 2)
    );

    const remainingWarnings =
        warnings[chatId]?.[targetUser] || 0;

    await sock.sendMessage(chatId, {
        text:

`✅ Warning Removed

👤 User: @${targetUser.split('@')[0]}
🛡️ Removed By: @${senderId.split('@')[0]}
⚠️ Remaining Warnings: ${remainingWarnings}/3`,
mentions: [targetUser, senderId]
});

} catch (error) {
    console.error('Unwarn Error:', error);

    await sock.sendMessage(chatId, {
        text: '❌ Failed to remove warning.'
    });
}

}

module.exports = unwarnCommand;
