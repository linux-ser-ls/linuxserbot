async function resetlinkCommand(sock, chatId, senderId) {
try {

```
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ This command can only be used in groups.'
        });
    }

    const groupMetadata = await sock.groupMetadata(chatId);

    const isAdmin = groupMetadata.participants.some(
        p =>
            p.id === senderId &&
            (p.admin === 'admin' ||
             p.admin === 'superadmin')
    );

    if (!isAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ Only group admins can use this command.'
        });
    }

    const processing = await sock.sendMessage(chatId, {
        text: '🔄 Resetting group invite link...'
    });

    try {

        await sock.groupRevokeInvite(chatId);

        const newCode =
            await sock.groupInviteCode(chatId);

        await sock.sendMessage(chatId, {
            text:
```

`✅ Group Link Reset Successfully

🔗 New Link:
https://chat.whatsapp.com/${newCode}

⚠️ Previous invite link is now invalid.`
}, {
edit: processing.key
});

```
    } catch (err) {

        console.error('Group Revoke Error:', err);

        await sock.sendMessage(chatId, {
            text:
```

`❌ Failed To Reset Group Link

Reason:
${err.message}`
}, {
edit: processing.key
});
}

```
} catch (error) {

    console.error('Reset Link Error:', error);

    await sock.sendMessage(chatId, {
        text:
```

`❌ Unexpected Error

${error.message}`
});
}
}

module.exports = resetlinkCommand;
