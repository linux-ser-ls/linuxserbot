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

You can convert images, text files, or direct text messages into a professional A4 PDF document.

*Option 1: Convert an Image / Multi-Images*
└ Reply to any image(s) with *.topdf*
└ Or send an image with *.topdf* as the caption.

*Option 2: Convert a Text File*
└ Reply to any *.txt* document with *.topdf*

*Option 3: Convert Direct Text*
└ Type *.topdf Your text message here...*

_Tip: The bot automatically adds page numbers, handles word-wrapping, and fits images perfectly!_`;
        
        await sock.sendMessage(chatId, { text: usageText }, { quoted: message });
    };

    if (!message || !message.message) return sendUsageMessage();

    const m = message.message;
    const messageType = Object.keys(m)[0];
    
    // Check if there is an explicit text input (Option 3: .topdf <text>)
    // Extracts everything after the first word/prefix
    const directTextContent = userMessage.replace(/^\.topdf\s*/i, '').trim();

    // Determine target context for media checking
    const isQuoted = messageType === 'extendedTextMessage';
    const quotedMessage = isQuoted ? m.extendedTextMessage.contextInfo?.quotedMessage : null;
    const targetMessage = quotedMessage || m;

    const imageMessage = targetMessage.imageMessage || m.imageMessage;
    const documentMessage = targetMessage.documentMessage || m.documentMessage;
    const mimeType = imageMessage?.mimetype || documentMessage?.mimetype || '';

    const isImage = mimeType.startsWith('image/');
    const isTxtFile = mimeType === 'text/plain';

    // Route decision validation
    if (!isImage && !isTxtFile && !directTextContent) {
        return sendUsageMessage();
    }

    const id = Date.now();
    const tempOutputPath = path.join(__dirname, `../assets/output-${id}.pdf`);
    const tempImages = [];

    try {
        await react('📄');

        // Initialize PDF Document (A4 Profile with buffered tracking)
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 40,
            bufferPages: true,
            info: {
                Title: 'Converted Document',
                Author: 'Linux Ser Bot',
                Subject: 'Media/Text to PDF Conversion'
            }
        });

        const writeStream = fs.createWriteStream(tempOutputPath);
        doc.pipe(writeStream);

        // --- PROCESSING PIPELINE ---

        if (isImage) {
            // --- OPTION 1: IMAGE PROCESSING ---
            // Check if user replied to an album/multi-images context if available, fallback to single frame buffer
            let buffersToProcess = [];
            
            const mediaBuffer = await downloadMediaMessage(
                { message: targetMessage },
                'buffer',
                {},
                { logger: console, reuploadRequest: sock.updateMediaMessage }
            );
            buffersToProcess.push(mediaBuffer);

            // Render pages loop
            for (let i = 0; i < buffersToProcess.length; i++) {
                if (i > 0) doc.addPage(); // Generate a new page for sequential elements
                
                const imgPath = path.join(__dirname, `../assets/input-img-${id}-${i}`);
                fs.writeFileSync(imgPath, buffersToProcess[i]);
                tempImages.push(imgPath);

                doc.image(imgPath, {
                    fit: [515, 762], 
                    align: 'center',
                    valign: 'center'
                });
            }

        } else if (isTxtFile) {
            // --- OPTION 2: TXT FILE CONVERSION ---
            const mediaBuffer = await downloadMediaMessage(
                { message: targetMessage },
                'buffer',
                {},
                { logger: console, reuploadRequest: sock.updateMediaMessage }
            );
            
            await react('📥');
            const textContent = mediaBuffer.toString('utf-8');
            doc.font('Helvetica').fontSize(12).lineGap(4).text(textContent, {
                width: 515,
                align: 'left',
                lineBreak: true
            });

        } else if (directTextContent) {
            // --- OPTION 3: DIRECT TEXT CONVERSION (.topdf <text>) ---
            await react('📥');
            doc.font('Helvetica').fontSize(12).lineGap(6).text(directTextContent, {
                width: 515,
                align: 'left',
                lineBreak: true
            });
        }

        // --- GLOBAL FOOTER GENERATOR ---
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

        // Finalize document build stream
        doc.end();

        // Await background filesystem drain events completely
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Send PDF back to chat room loop
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tempOutputPath),
            mimetype: 'application/pdf',
            fileName: `linux_ser.pdf`
        }, { quoted: message });

        await react('✅');

    } catch (error) {
        console.error('PDF Conversion Fatal Error:', error);
        await react('❌');
        await sock.sendMessage(chatId, { text: '❌ Failed to process and convert file to PDF.' }, { quoted: message });
    } finally {
        // Safe runtime engine file garbage cleanup
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        for (const imgPath of tempImages) {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
    }
}

module.exports = topdfCommand;
