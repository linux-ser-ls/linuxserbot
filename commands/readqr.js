const jsQR = require('jsqr');
const { Jimp } = require('jimp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function readQrCommand(sock, chatId, message) {
try {

    const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return await sock.sendMessage(chatId, {
            text: `

📷 QR Reader

Usage:

1. Send a QR image

2. Reply to it

3. Type .readqr
   `.trim()
   }, { quoted: message });
   }
   
    let imageMessage = null;

 if (quoted.imageMessage) {
     imageMessage = quoted.imageMessage;
 }

 if (quoted?.viewOnceMessage?.message?.imageMessage) {
     imageMessage =
         quoted.viewOnceMessage.message.imageMessage;
 }

 if (!imageMessage) {
     return await sock.sendMessage(chatId, {
         text: `

*📷 QR Reader*

Usage:

1. Send a QR image

2. Reply to it

3. Type .readqr
   `.trim()
   }, { quoted: message });
   }
   
    const stream = await downloadContentFromMessage(
     imageMessage,
     'image'
 );

 let buffer = Buffer.alloc(0);

 for await (const chunk of stream) {
     buffer = Buffer.concat([buffer, chunk]);
 }

 const image = await Jimp.read(buffer);

 const {
     data,
     width,
     height
 } = image.bitmap;

 const code = jsQR(
     new Uint8ClampedArray(data),
     width,
     height
 );

 if (!code) {
     return await sock.sendMessage(chatId, {
         text: '❌ No QR code detected in this image.'
     }, { quoted: message });
 }

 await sock.sendMessage(chatId, {
     text: `

*📱 QR Code Detected*

📝 Content: ${code.data}
`.trim()
}, { quoted: message });

} catch (err) {

    console.error('READQR ERROR:', err);

    await sock.sendMessage(chatId, {
        text: `❌ QR Read Failed\n\n${err.message}`
    }, { quoted: message });
}

};
