const os = require('os');

function formatRuntime(seconds) {
    seconds = Number(seconds);

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    return `${d}d ${h}h ${m}m ${s}s`;
}

async function runtimeCommand(sock, chatId, message) {
    const runtime = formatRuntime(process.uptime());

    const text = `
⏳ Runtime

⚡ Uptime : ${runtime}
🖥️ Platform : ${os.platform()}
📦 Memory : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
`.trim();

    await sock.sendMessage(
        chatId,
        { text },
        { quoted: message }
    );
}

module.exports = runtimeCommand;
