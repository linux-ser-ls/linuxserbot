const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function topdfCommand(sock, chatId, message) {
    const react = async (emoji) => {
        await sock.sendMessage(chatId, { react: { text: emoji, key: message.key } });
    };

    // Helper for clean usage message
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

    // 1. Check message and context structure
    const messageType = Object.keys(message.message || {})[0];
    if (!messageType) return sendUsageMessage();

    const isQuoted = messageType === 'extendedTextMessage';
    const quotedMessage = isQuoted ? message.message.extendedTextMessage.contextInfo?.quotedMessage : null;
    
    // Target message contains the actual media (either direct or quoted)
    const targetMessage = quotedMessage || message.message;
    if (!targetMessage) return sendUsageMessage();

    const hasImage = targetMessage.imageMessage;
    const hasDocument = targetMessage.documentMessage;
    const mimeType = hasImage?.mimetype || hasDocument?.mimetype || '';

    // Validate if it's a convertible format
    const isImage = mimeType.startsWith('image/');
    const isTxt = mimeType === 'text/plain';

    // Trigger usage message if the format is invalid or missing
    if (!isImage && !isTxt) {
        return sendUsageMessage();
    }

    // Setup file paths
    const id = Date.now();
    const tempInputPath = path.join(__dirname, `../assets/input-${id}`);
    const tempOutputPath = path.join(__dirname, `../assets/output-${id}.pdf`);

    try {
        // Progress 1: Processing started
        await react('📄');

        // 2. Download the media from WhatsApp
        const mediaBuffer = await downloadMediaMessage(
            { message: targetMessage },
            'buffer',
            {},
            { logger: console }
        );

        // Progress 2: Generation started
        await react('📥');

        // 3. Initialize PDFKit Document (A4 Size)
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 40,
            info: {
                Title: 'Converted Document',
                Author: 'ʟɪɴᴜx ꜱᴇʀ ʙᴏᴛ',
                Subject: 'Image/Text to PDF Conversion'
            }
        });

        const writeStream = fs.createWriteStream(tempOutputPath);
        doc.pipe(writeStream);

        if (isImage) {
            // --- IMAGE TO PDF LOGIC ---
            fs.writeFileSync(tempInputPath, mediaBuffer);
            
            doc.image(tempInputPath, {
                fit: [515, 762], 
                align: 'center',
                valign: 'center'
            });
            
        } else if (isTxt) {
            // --- TXT TO PDF LOGIC ---
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

        // --- GLOBAL FOOTER (Page Numbers) ---
        let pages = doc._path.pages;
        for (let i = 0; i < pages.length; i++) {
            doc.switchToPage(i);
            doc.fontSize(9)
               .fillColor('gray')
               .text(
                   `Page ${i + 1} of ${pages.length}`, 
                   40, 
                   doc.page.height - 30, 
                   { align: 'center', width: 515 }
               );
        }

        // Finalize PDF file write
        doc.end();

        // Wait for the stream to finish writing completely
        await new Promise((resolve) => writeStream.on('finish', resolve));

        // 4. Send the PDF Document back to WhatsApp
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tempOutputPath),
            mimetype: 'application/pdf',
            fileName: `linux_ser.pdf`
        }, { quoted: message });

        // Progress 3: Success
        await react('✅');

    } catch (error) {
        console.error('PDF Conversion Error:', error);
        await react('❌');
        await sock.sendMessage(chatId, { text: '❌ Failed to convert file to PDF.' }, { quoted: message });
    } finally {
        // 5. Cleanup temporary storage files
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    }
}

module.exports = topdfCommand;
