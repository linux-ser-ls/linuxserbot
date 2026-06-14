const axios = require('axios');

async function imgCommand(sock, chatId, message, args) {

    try {

        const query = args.join(' ');

        // No query
        if (!query) {

            return await sock.sendMessage(chatId, {
                text:
`*🌷✨ Image Search ✨🌷*

_⚠️ Please enter a search text_

_🔎 Example: .img Kerala_

_🖼️ Find any image instantly ✨_`
            }, {
                quoted: message
            });

        }

        // Loading reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '🔍',
                key: message.key
            }
        });

        // API Key
        const apiKey =
            global.APIKeys['https://api.pexels.com'];

        // Fetch relevant images
        const response = await axios.get(

            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`,

            {
                headers: {
                    Authorization: apiKey
                }
            }

        );

        // No result
        if (!response.data.photos.length) {

            return await sock.sendMessage(chatId, {
                text:
`*🫧✨ Image Search ✨🫧*

_❌ No image were found_

*🔍 Try:*
• _Anime_
• _Cat_
• _Nature_
• _Car_

_🌷 The result might be available with other keywords_`
            }, {
                quoted: message
            });

        }

        // Best matching image
        const bestImage = response.data.photos[0];

        const imageUrl = bestImage.src.large;

        // Send image
        await sock.sendMessage(chatId, {

            image: {
                url: imageUrl
            },

            caption:
`_🔍 ${query} → Image found ✅_`

        }, {
            quoted: message
        });

        // Success reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '✅',
                key: message.key
            }
        });

    } catch (err) {

        console.log('IMG SEARCH ERROR:', err);

        // Error message
        await sock.sendMessage(chatId, {
            text:
`*❌ Image Fetch Failed*

_⚠️ Failed to fetch image_
_🌐 Check your internet or API_

_🔄 Try again later_`
        }, {
            quoted: message
        });

        // Error reaction
        await sock.sendMessage(chatId, {
            react: {
                text: '❌',
                key: message.key
            }
        });

    }

}

module.exports = imgCommand;
