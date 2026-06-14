const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// ======================
// EMOJIMIX COMMAND
// ======================

async function emojimixCommand(
    sock,
    chatId,
    msg
) {

    try {

        // ======================
        // GET TEXT
        // ======================

        const text =

            msg.message?.conversation?.trim() ||

            msg.message?.extendedTextMessage
            ?.text?.trim() ||

            '';

        const args =
        text.split(' ').slice(1);

        // ======================
        // NO INPUT
        // ======================

        if (!args[0]) {

            await sock.sendMessage(chatId, {

                react: {
                    text: '🎭',
                    key: msg.key
                }

            });

            return await sock.sendMessage(chatId, {

                text:
`*🎨 Emoji Mix*

_😊 Please provide two emojis to mix_

_📌 Usage: .emojimix <emoji1>+<emoji2>_

_🌷 Example: .emix 🗣️+🧠_`

            }, { quoted: msg });

        }

        // ======================
        // INVALID FORMAT
        // ======================

        if (!args[0].includes('+')) {

            await sock.sendMessage(chatId, {

                react: {
                    text: '⚠️',
                    key: msg.key
                }

            });

            return await sock.sendMessage(chatId, {

                text:
`*⚠️ Invalid format*

_➕ Please separate emojis using the + symbol_

_📌 Example: .emojimix 😊+❤️_`

            }, { quoted: msg });

        }

        // ======================
        // LOADING REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '🎨',
                key: msg.key
            }

        });

        // ======================
        // SPLIT EMOJIS
        // ======================

        let [emoji1, emoji2] =

        args[0]
        .split('+')
        .map(e => e.trim());

        // ======================
        // TENOR API
        // ======================

        const url =

`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response =
        await fetch(url);

        const data =
        await response.json();

        // ======================
        // NO RESULTS
        // ======================

        if (
            !data.results ||
            data.results.length === 0
        ) {

            await sock.sendMessage(chatId, {

                react: {
                    text: '❌',
                    key: msg.key
                }

            });

            return await sock.sendMessage(chatId, {

                text:
`_❌ These emojis cannot be mixed_

_📌 Try different emojis_`

            }, { quoted: msg });

        }

        // ======================
        // GET IMAGE URL
        // ======================

        const imageUrl =
        data.results[0].url;

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
        // FILE PATHS
        // ======================

        const tempFile =

        path.join(

            tmpDir,

`temp_${Date.now()}.png`

        ).replace(/\\/g, '/');

        const outputFile =

        path.join(

            tmpDir,

`sticker_${Date.now()}.webp`

        ).replace(/\\/g, '/');

        // ======================
        // DOWNLOAD IMAGE
        // ======================

        const imageResponse =
        await fetch(imageUrl);

        const buffer =
        await imageResponse.buffer();

        fs.writeFileSync(
            tempFile,
            buffer
        );

        // ======================
        // FFMPEG
        // ======================

        const ffmpegCommand =

`ffmpeg -y -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;

        await new Promise(

            (
                resolve,
                reject
            ) => {

                exec(

                    ffmpegCommand,

                    (error) => {

                        if (error) {

                            console.error(
                                'FFmpeg Error:',
                                error
                            );

                            reject(error);

                        }

                        else {

                            resolve();

                        }

                    }

                );

            }

        );

        // ======================
        // CHECK OUTPUT
        // ======================

        if (
            !fs.existsSync(outputFile)
        ) {

            throw new Error(
                'Sticker creation failed'
            );

        }

        // ======================
        // READ STICKER
        // ======================

        const stickerBuffer =

        fs.readFileSync(
            outputFile
        );

        // ======================
        // SEND STICKER
        // ======================

        await sock.sendMessage(chatId, {

            sticker:
            stickerBuffer,

            packname:
            '𝐋ɪɴᴜх 𝐒ᴇʀ 🧃🕊️',

            author:
            'Emoji Mix'

        }, { quoted: msg });

        // ======================
        // SUCCESS REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '✅',
                key: msg.key
            }

        });

        // ======================
        // CLEANUP
        // ======================

        try {

            if (
                fs.existsSync(tempFile)
            ) {

                fs.unlinkSync(
                    tempFile
                );

            }

            if (
                fs.existsSync(outputFile)
            ) {

                fs.unlinkSync(
                    outputFile
                );

            }

        }

        catch (cleanupError) {

            console.error(
                'Cleanup Error:',
                cleanupError
            );

        }

    }

    catch (error) {

        console.error(
            'EmojiMix Error:',
            error
        );

        // ======================
        // ERROR REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '❌',
                key: msg.key
            }

        });

        // ======================
        // ERROR MESSAGE
        // ======================

        await sock.sendMessage(chatId, {

            text:
`_❌ Failed to create emoji sticker_

_📌 Example: .emojimix 😎+🥰_`

        }, { quoted: msg });

    }

}

module.exports = emojimixCommand;
