const axios = require('axios');

async function ytmp3Command(sock, chatId, message, args = []) {
try {

    const url = Array.isArray(args)
        ? args.join(' ').trim()
        : String(args || '').trim();

    if (
        !url ||
        (!url.includes('youtube.com') &&
         !url.includes('youtu.be'))
    ) {

        return await sock.sendMessage(chatId, {
            text:
`🎵 *YTMP3 Downloader*

📌 Usage:
.ytmp3 <youtube link>

Example:
.ytmp3 https://youtu.be/dQw4w9WgXcQ`
        }, {
            quoted: message
        });
    }

    await sock.sendMessage(chatId, {
        react: {
            text: '🎧',
            key: message.key
        }
    });

    const api =
`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(api, {
        timeout: 60000
    });

    if (
        !data.success ||
        !data.data ||
        !data.data.download_url
    ) {
        throw new Error('Download link not found');
    }

    const audioUrl = data.data.download_url;

    await sock.sendMessage(chatId, {
        image: {
            url: data.data.thumbnail
        },
        caption:
`🎵 *${data.data.title}*

⏳ Downloading Audio...`
    }, {
        quoted: message
    });

    const audio = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 120000
    });

    await sock.sendMessage(chatId, {
        document: Buffer.from(audio.data),
        mimetype: 'audio/mpeg',
        fileName: `${data.data.title}.mp3`
    }, {
        quoted: message
    });

    await sock.sendMessage(chatId, {
        react: {
            text: '✅',
            key: message.key
        }
    });

} catch (err) {

    console.error(err);

    await sock.sendMessage(chatId, {
        react: {
            text: '❌',
            key: message.key
        }
    });

    await sock.sendMessage(chatId, {
        text:
`❌ Failed to download audio.

Reason:
${err.message}`
    }, {
        quoted: message
    });
}
}

module.exports = ytmp3Command;
