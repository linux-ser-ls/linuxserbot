const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function topdfCommand(sock, chatId, message, userMessage) {
    const react = async (emoji) => {
        await sock.sendMessage(chatId, { react: { text: emoji, key: message.key } });
    };

    // Helper for clean usage guide message
    const sendUsageMessage = async () => {
        const usageText = `💡 *How to use .topdf*

You can convert both images and text files into a professional A4 PDF document.

*Option 1: Convert an Image*
└ Reply to any image with *.topdf*
└ Or send an image with *.topdf* as the caption.

*Option 2: Convert a Text File*
└ Reply to any *.txt* document with *.topdf*

_Tip: The bot automatically adds page numbers and scales images perfectly!_`;
        
        await sock.sendMessage(chatId, { text: usageText }, { quoted: message });
    };

    // 1. Initial Structural Validation
    if (!message || !message.message) return sendUsageMessage();
    
    const messageType = Object.keys(message.message)[0];
    const isQuoted = messageType === 'extendedTextMessage';
    const quotedMessage = isQuoted ? message.message.extendedTextMessage.contextInfo?.quotedMessage : null;
    
    const targetMessage = quotedMessage || message.message;
    if (!targetMessage) return sendUsageMessage();

    const hasImage = targetMessage.imageMessage;
    const hasDocument = targetMessage.documentMessage;
    const mimeType = hasImage?.mimetype || hasDocument?.mimetype || '';

    // Validate if it's a convertible format
    const isImage = mimeType.startsWith('image/');
    const isTxt = mimeType === 'text/plain';

    if (!isImage && !isTxt) {
        return sendUsageMessage();
    }

    // Setup temporary clean folder paths
    const id = Date.now();
    const tempInputPath = path.join(__dirname, `../assets/input-${id}`);
    const tempOutputPath = path.join(__dirname, `../assets/output-${id}.pdf`);

    try {
        // Progress 1: File Found
        await react('📄');

        // 2. Download Media Stream safely via Baileys core
        const mediaBuffer = await downloadMediaMessage(
            { message: targetMessage },
            'buffer',
            {},
            { logger: console }
        );

        // Progress 2: Building Document structure
        await react('📥');

        // 3. Initialize PDF Document (A4 Profile with buffered tracking)
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 40,
            bufferPages: true, // CRITICAL: Holds pages in RAM to calculate exact totals
            info: {
                Title: 'Converted Document',
                Author: 'Linux Ser Bot',
                Subject: 'Image/Text to PDF Conversion'
            }
        });

        const writeStream = fs.createWriteStream(tempOutputPath);
        doc.pipe(writeStream);

        if (isImage) {
            // --- IMAGE ELEMENT RENDER ---
            fs.writeFileSync(tempInputPath, mediaBuffer);
            doc.image(tempInputPath, {
                fit: [515, 762], // Keeps original ratio safely bound inside print box
                align: 'center',
                valign: 'center'
            });
        } else if (isTxt) {
            // --- TXT DOCUMENT STRING WRAP ---
            const textContent = mediaBuffer.toString('utf-8');
            doc.font('Helvetica')
               .fontSize(12)
               .lineGap(4)
               .text(textContent, {
                   width: 515,
                   align: 'left',
                   lineBreak: true
               });
        }

        // --- GLOBAL FOOTER MANAGER ---
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(9)
               .fillColor('gray')
               .text(
                   `Page ${i + 1} of ${range.count}`, 
                   40, 
                   doc.page.height - 30, 
                   { align: 'center', width: 515 }
               );
        }

        // Close stream writer
        doc.end();

        // Await filesystem buffer drain event entirely
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // 4. Dispatch final high-quality output document
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tempOutputPath),
            mimetype: 'application/pdf',
            fileName: `linux_ser.pdf`
        }, { quoted: message });

        // Success Reaction
        await react('✅');

    } catch (error) {
        console.error('PDF Conversion Fatal Error:', error);
        await react('❌');
        await sock.sendMessage(chatId, { text: '❌ Failed to process and convert file to PDF.' }, { quoted: message });
    } finally {
        // 5. Hard cache system cleaning
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    }
}

module.exports = topdfCommand;
