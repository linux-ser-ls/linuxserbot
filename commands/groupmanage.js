const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function ensureGroupAndAdmin(
    sock,
    chatId,
    senderId
) {

    const isGroup =
    chatId.endsWith('@g.us');

    // ======================
    // GROUP CHECK
    // ======================

    if (!isGroup) {

        await sock.sendMessage(chatId, {

            text:
`*⚠️ Group Only*

_👥 This command is available_
_💫 only in group chats_

_🌷 Please use it in a group ✨_`

        });

        return { ok: false };

    }

    // ======================
    // ADMIN CHECK
    // ======================

    const isAdmin =
    require('../lib/isAdmin');

    const adminStatus =
    await isAdmin(
        sock,
        chatId,
        senderId
    );

    // ======================
    // BOT ADMIN CHECK
    // ======================

    if (!adminStatus.isBotAdmin) {

        await sock.sendMessage(chatId, {

            text:
`*🤖 Bot Admin Required*

_⚠️ Please make the bot an admin_
_🛡️ before using this command_

_🌷 Grant admin privileges and try again ✨_`

        });

        return { ok: false };

    }

    // ======================
    // SENDER ADMIN CHECK
    // ======================

    if (!adminStatus.isSenderAdmin) {

        await sock.sendMessage(chatId, {

            text:
`*🚫 Access Denied*

_👑 Only group admins_
_💫 can use this command_

_🛡️ Permission required to continue_

_🌷 Admin access only ✨_`

        });

        return { ok: false };

    }

    return { ok: true };

}

// ======================
// SET GROUP DESCRIPTION
// ======================

async function setGroupDescription(
    sock,
    chatId,
    senderId,
    text,
    message
) {

    const check =
    await ensureGroupAndAdmin(
        sock,
        chatId,
        senderId
    );

    if (!check.ok) return;

    const desc =
    (text || '').trim();

    // ======================
    // NO DESCRIPTION
    // ======================

    if (!desc) {

        return await sock.sendMessage(chatId, {

            text:
`*📝 Set Group Description ✨*

_💭 Please provide a new group description_

_📌 Example: .setgdesc Hello_

_🌷 Update your group's description with ease ✨_`

        }, { quoted: message });

    }

    try {

        // ======================
        // REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '📝',
                key: message.key
            }

        });

        // ======================
        // UPDATE DESCRIPTION
        // ======================

        await sock.groupUpdateDescription(
            chatId,
            desc
        );

        await sock.sendMessage(chatId, {

            text:
`_✅ Group description updated successfully!_`

        }, { quoted: message });

        // ======================
        // SUCCESS REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '✅',
                key: message.key
            }

        });

    }

    catch (e) {

        // ======================
        // ERROR REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '❌',
                key: message.key
            }

        });

        await sock.sendMessage(chatId, {

            text:
`_❌ Failed to update group description!_`

        }, { quoted: message });

    }

}

// ======================
// SET GROUP NAME
// ======================

async function setGroupName(
    sock,
    chatId,
    senderId,
    text,
    message
) {

    const check =
    await ensureGroupAndAdmin(
        sock,
        chatId,
        senderId
    );

    if (!check.ok) return;

    const name =
    (text || '').trim();

    // ======================
    // NO NAME
    // ======================

    if (!name) {

        return await sock.sendMessage(chatId, {

            text:
`╭━━━〔 🏷️ Set Group Name 〕━━━╮
┃ ✦ Please provide
┃ ✦ new group name
┃
┃ 📌 Example:
┃ ✦ .setgname Linux Ser
╰━━━━━━━━━━━━━━━━━━━━╯`

        }, { quoted: message });

    }

    try {

        // ======================
        // REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '🏷️',
                key: message.key
            }

        });

        // ======================
        // UPDATE GROUP NAME
        // ======================

        await sock.groupUpdateSubject(
            chatId,
            name
        );

        await sock.sendMessage(chatId, {

            text:
`_✅ Group name updated successfully!_`

        }, { quoted: message });

        // ======================
        // SUCCESS REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '✅',
                key: message.key
            }

        });

    }

    catch (e) {

        // ======================
        // ERROR REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '❌',
                key: message.key
            }

        });

        await sock.sendMessage(chatId, {

            text:
`_❌ Failed to update group name!_`

        }, { quoted: message });

    }

}

// ======================
// SET GROUP PHOTO
// ======================

async function setGroupPhoto(
    sock,
    chatId,
    senderId,
    message
) {

    const check =
    await ensureGroupAndAdmin(
        sock,
        chatId,
        senderId
    );

    if (!check.ok) return;

    const quoted =

        message.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;

    const imageMessage =

        quoted?.imageMessage ||

        quoted?.stickerMessage;

    // ======================
    // NO IMAGE
    // ======================

    if (!imageMessage) {

        return await sock.sendMessage(chatId, {

            text:
`╭━━━〔 🖼️ Set Group Photo 〕━━━╮
┃ ✦ Reply to image
┃ ✦ or sticker
┃
┃ 📌 Example:
┃ ✦ Reply image + .setgpp
╰━━━━━━━━━━━━━━━━━━━━━━╯`

        }, { quoted: message });

    }

    try {

        // ======================
        // REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '🖼️',
                key: message.key
            }

        });

        // ======================
        // TMP DIRECTORY
        // ======================

        const tmpDir =

        path.join(
            process.cwd(),
            'tmp'
        );

        if (
            !fs.existsSync(tmpDir)
        ) {

            fs.mkdirSync(

                tmpDir,

                {
                    recursive: true
                }

            );

        }

        // ======================
        // DOWNLOAD IMAGE
        // ======================

        const stream =

        await downloadContentFromMessage(
            imageMessage,
            'image'
        );

        let buffer =
        Buffer.from([]);

        for await (
            const chunk of stream
        ) {

            buffer =
            Buffer.concat([
                buffer,
                chunk
            ]);

        }

        const imgPath =

        path.join(

            tmpDir,

`gpp_${Date.now()}.jpg`

        );

        // ======================
        // SAVE IMAGE
        // ======================

        fs.writeFileSync(
            imgPath,
            buffer
        );

        // ======================
        // UPDATE PHOTO
        // ======================

        await sock.updateProfilePicture(

            chatId,

            {
                url: imgPath
            }

        );

        try {

            fs.unlinkSync(
                imgPath
            );

        }

        catch (_) {}

        // ======================
        // SUCCESS MESSAGE
        // ======================

        await sock.sendMessage(chatId, {

            text:
`_✅ Group profile photo updated successfully!_`

        }, { quoted: message });

        // ======================
        // SUCCESS REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '✅',
                key: message.key
            }

        });

    }

    catch (e) {

        // ======================
        // ERROR REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '❌',
                key: message.key
            }

        });

        await sock.sendMessage(chatId, {

            text:
`_❌ Failed to update group profile photo!_`

        }, { quoted: message });

    }

}

module.exports = {

    setGroupDescription,
    setGroupName,
    setGroupPhoto

};
