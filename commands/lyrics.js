const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle, message) {
    if (!songTitle) {
        await sock.sendMessage(chatId, {
            text: `🎵 *Lyrics Finder* ✨

_🔍 Please enter a song name_

_📌 Usage: .lyrics <song name>_

_🌷 Find lyrics instantly ✨_`
        }, { quoted: message });
        return;
    }

    try {
        const apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            await sock.sendMessage(chatId, {
                text: `❌ No lyrics found for "${songTitle}".`
            }, { quoted: message });
            return;
        }

        const song = data[0];

        const lyrics =
            song.plainLyrics ||
            song.syncedLyrics ||
            null;

        if (!lyrics) {
            await sock.sendMessage(chatId, {
                text: `❌ Lyrics unavailable for "${songTitle}".`
            }, { quoted: message });
            return;
        }

        const maxChars = 4000;
        const output = lyrics.length > maxChars
            ? lyrics.substring(0, maxChars) + "\n\n..."
            : lyrics;

        await sock.sendMessage(chatId, {
            text: `🎵 Song: *${song.trackName || songTitle}*

👤 Artist: *${song.artistName || "Unknown"}*

${output}

🌷✨`
        }, { quoted: message });

    } catch (error) {
        console.error('Lyrics Error:', error);

        await sock.sendMessage(chatId, {
            text: `❌ Failed to fetch lyrics.

🔄 Please try again later.`
        }, { quoted: message });
    }
}

module.exports = { lyricsCommand };
