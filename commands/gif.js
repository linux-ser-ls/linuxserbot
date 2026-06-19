const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const {
downloadContentFromMessage
} = require('@whiskeysockets/baileys');

async function gifCommand(
sock,
chatId,
message
) {
try {

    const quoted =
        message.message?.extendedTextMessage
            ?.contextInfo?.quotedMessage;

    if (
        !quoted ||
        !quoted.videoMessage
    ) {
        return await sock.sendMessage(
            chatId,
            {
                text:

`🎬 GIF Converter

Reply to a video with:

.gif`
},
{ quoted: message }
);
}

    const processing =
        await sock.sendMessage(
            chatId,
            {
                text:

'🎬 Converting video to GIF...'
},
{ quoted: message }
);

    const stream =
        await downloadContentFromMessage(
            quoted.videoMessage,
            'video'
        );

    const chunks = [];

    for await (
        const chunk of stream
    ) {
        chunks.push(chunk);
    }

    const buffer =
        Buffer.concat(chunks);

    const input =
    path.join(__dirname,
    `video_${Date.now()}.mp4`);

const output =
    path.join(__dirname,
    `gif_${Date.now()}.mp4`);

    fs.writeFileSync(
        input,
        buffer
    );

    await new Promise(
        (
            resolve,
            reject
        ) => {

            ffmpeg(input)
                .outputOptions([
                    '-vf scale=512:-1',
                    '-r 15'
                ])
                .toFormat('mp4')
                .save(output)
                .on(
                    'end',
                    resolve
                )
                .on(
                    'error',
                    reject
                );
        }
    );

    await sock.sendMessage(
        chatId,
        {
            video:
            fs.readFileSync(
                output
            ),
            gifPlayback: true,
            caption:

'✅ Converted To GIF'
}
);

    fs.unlinkSync(input);
    fs.unlinkSync(output);

} catch (error) {

    console.error(
        'GIF Error:',
        error
    );

    await sock.sendMessage(
        chatId,
        {
            text:

`❌ GIF Conversion Failed

${error.message}`
},
{ quoted: message }
);
}
}

module.exports = gifCommand;
