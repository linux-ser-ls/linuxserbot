const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const {
downloadContentFromMessage
} = require("@whiskeysockets/baileys");

async function downloadMedia(msg, type) {
let buffer = Buffer.from([]);

const stream =
await downloadContentFromMessage(msg, type);

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]);
}

return buffer;
}

async function topdf(sock, chatId, message) {

try {

const quoted =
message.message?.extendedTextMessage
?.contextInfo?.quotedMessage;

if (!quoted) {
return sock.sendMessage(chatId,{
text:
"📄 Reply to an image\n\n📌 Example:\n.topdf"
},{quoted:message});
}

let pdf = await PDFDocument.create();

if (quoted.imageMessage) {

const imgBuffer =
await downloadMedia(
quoted.imageMessage,
"image"
);

const png =
await sharp(imgBuffer)
.png()
.toBuffer();

const image =
await pdf.embedPng(png);

const page =
pdf.addPage([
image.width,
image.height
]);

page.drawImage(image,{
x:0,
y:0,
width:image.width,
height:image.height
});

}

else if (
quoted.documentMessage &&
quoted.documentMessage.fileName.endsWith(".txt")
){

const txt =
await downloadMedia(
quoted.documentMessage,
"document"
);

const text =
txt.toString("utf8");

const page =
pdf.addPage([595,842]);

page.drawText(text,{
x:40,
y:800,
size:12,
maxWidth:500
});

}

else{

return sock.sendMessage(chatId,{
text:"❌ Supported:\n• Image\n• TXT"
},{quoted:message});

}

const pdfBytes =
await pdf.save();

await sock.sendMessage(chatId,{
document:Buffer.from(pdfBytes),
mimetype:"application/pdf",
fileName:"linux_ser.pdf"
},{quoted:message});

}catch(err){

console.log(err);

await sock.sendMessage(chatId,{
text:"❌ Failed to create PDF."
},{quoted:message});

}

}

module.exports = topdf;
