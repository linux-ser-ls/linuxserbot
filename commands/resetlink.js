async function resetlinkCommand(sock, chatId, senderId) {
try {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ This command can only be used in groups.'
        });
    }

    const groupMetadata = await sock.groupMetadata(chatId);

    const admins = groupMetadata.participants.filter(
        p => p.admin !== null
    );

    const isAdmin = admins.some(
        p => p.id === senderId
    );

    const botParticipant = groupMetadata.participants.find(
        p => p.id.split('@')[0].split(':')[0] ===
        sock.user.id.split('@')[0].split(':')[0]
    );

const isBotAdmin = !!botParticipant?.admin;


    if (!isAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ Only group admins can use this command.'
        });
    }

    if (!isBotAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ Please make me an admin first.'
        });
    }

    await sock.sendMessage(chatId, {
        text: '🔄 Resetting group invite link...'
    });

    await sock.groupRevokeInvite(chatId);

    const newCode =
        await sock.groupInviteCode(chatId);

    const newLink =
        `https://chat.whatsapp.com/${newCode}`;

    await sock.sendMessage(chatId, {
        text:

`✅ Group Link Reset Successfully

🔗 New Invite Link: ${newLink}`
});

} catch (error) {

    console.error(
        'Reset Link Error:',
        error
    );

    await sock.sendMessage(chatId, {
        text:
`❌ Failed to reset group link.

${error.message}`
});
}
}

module.exports = resetlinkCommand;