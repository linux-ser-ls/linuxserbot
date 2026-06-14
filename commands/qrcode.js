const QRCode = require('qrcode');

module.exports = async function qrCommand(sock, chatId, message) {
try {

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';

    const input = text.split(' ').slice(1).join(' ').trim();

    if (!input) {
        return await sock.sendMessage(chatId, {
            text:

`*📱 QR Code Generator*

Usage:
.qr your text

Example:
.qr Hello World

.qr https://google.com`
}, { quoted: message });
}

    const qrBuffer = await QRCode.toBuffer(input, {
        width: 800,
        margin: 2
    });

    await sock.sendMessage(
        chatId,
        {
            image: qrBuffer,
            caption:

`*📱 QR Code Generated*

📝 Content: ${input.length > 100 ? input.slice(0, 100) + '...' : input}`
},
{ quoted: message }
);

} catch (err) {
    console.error('QR ERROR:', err);

    await sock.sendMessage(chatId, {
        text: '❌ Failed to generate QR code.'
    }, { quoted: message });
}

};
