const songCommand = require('./song');

async function playCommand(
    sock,
    chatId,
    message,
    args = []
) {

    try {

        // ================= GET MESSAGE =================

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        // REMOVE .play
        let query = text
            .replace(/^\.play/i, '')
            .trim();

        // USE ARGS IF AVAILABLE
        if (
            Array.isArray(args) &&
            args.length > 0
        ) {

            query = args.join(' ').trim();
        }

        // ================= EMPTY QUERY =================

        if (!query || query.length === 0) {

            return await sock.sendMessage(chatId, {
                text:
`*🎵 Play Downloader ✨*

_💭 Please provide a song name_

_📌 Usage: .play <song name>_

_🌷 Example: .play Faded_

_✨ Search • Download • Enjoy_`
            }, {
                quoted: message
            });
        }

        // ================= RUN SONG COMMAND =================

        await songCommand(
            sock,
            chatId,
            message,
            query.split(' ')
        );

    } catch (err) {

        console.error(
            'Play command error:',
            err
        );

        // ERROR REACTION
        await sock.sendMessage(chatId, {
            react: {
                text: '❌',
                key: message.key
            }
        });

        await sock.sendMessage(chatId, {
            text:
`*🎶✨ Play Downloader*

_❌ Failed to process the song_

_💫 The music could not be fetched_
_🔄 Please try again later_

_🌷 Keep the music going ✨_`
        }, {
            quoted: message
        });
    }
}

module.exports = playCommand;
