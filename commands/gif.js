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
let inputFile = null;
let outputFile = null;

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

    const duration =
        quoted.videoMessage.seconds || 0;

    if (duration > 60) {
        return await sock.sendMessage(
            chatId,
            {
                text:

'❌ Video must be under 1 minutes.'
},
{ quoted: message }
);
}

    const progress =
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

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    const buffer =
        Buffer.concat(chunks);

    const stamp = Date.now();

    inputFile =
        path.join(
            process.cwd(),
            `input_${stamp}.mp4`
        );

    outputFile =
        path.join(
            process.cwd(),
            `gif_${stamp}.mp4`
        );

    fs.writeFileSync(
        inputFile,
        buffer
    );

    await new Promise(
        (
            resolve,
            reject
        ) => {

            ffmpeg(inputFile)
                .videoCodec('libx264')
                .outputOptions([
                    '-vf scale=480:-2',
                    '-preset ultrafast',
                    '-pix_fmt yuv420p',
                    '-movflags +faststart'
                ])
                .output(outputFile)
                .on(
                    'end',
                    resolve
                )
                .on(
                    'error',
                    reject
                )
                .run();
        }
    );

    const gifBuffer =
        fs.readFileSync(
            outputFile
        );

    await sock.sendMessage(
        chatId,
        {
            video: gifBuffer,
            gifPlayback: true,
            caption:

'✅ GIF Created Successfully'
},
{
quoted: message
}
);

    try {

        await sock.sendMessage(
            chatId,
            {
                text:

'✅ Conversion Complete',
edit:
progress.key
}
);

    } catch {}

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

} finally {

    try {

        if (
            inputFile &&
            fs.existsSync(
                inputFile
            )
        ) {
            fs.unlinkSync(
                inputFile
            );
        }

        if (
            outputFile &&
            fs.existsSync(
                outputFile
            )
        ) {
            fs.unlinkSync(
                outputFile
            );
        }

    } catch {}
}

}

module.exports = gifCommand;
