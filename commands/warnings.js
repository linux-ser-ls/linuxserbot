const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

function loadWarnings() {
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}, null, 2));
    }

    try {
        return JSON.parse(
            fs.readFileSync(warningsFilePath, 'utf8')
        );
    } catch {
        return {};
    }
}

async function warningsCommand(sock, chatId, mentionedJidList) {

    const warnings = loadWarnings();

    if (!mentionedJidList || mentionedJidList.length === 0) {
        return await sock.sendMessage(chatId, {
            text: '❌ Mention a user to check warnings.'
        });
    }

    const targetUser = mentionedJidList[0];

    let warningCount = 0;

    if (
        warnings[chatId] &&
        warnings[chatId][targetUser]
    ) {
        warningCount =
            warnings[chatId][targetUser];
    }

    await sock.sendMessage(chatId, {
        text:
`⚠️ Warning Information

👤 User: @${targetUser.split('@')[0]}
📊 Warnings: ${warningCount}/3`,
        mentions: [targetUser]
    });
}

module.exports = warningsCommand;