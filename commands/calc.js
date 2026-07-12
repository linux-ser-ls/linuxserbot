async function calcCommand(
    sock,
    chatId,
    message,
    text
) {

    try {

        // ======================
        // REACTION FUNCTION
        // ======================

        const react = async (
            emoji
        ) => {

            await sock.sendMessage(chatId, {

                react: {
                    text: emoji,
                    key: message.key
                }

            });

        };

        // ======================
        // NO INPUT
        // ======================

        if (!text) {

            await react('🧮');

            return await sock.sendMessage(chatId, {

                text:
`Please provide a math expression 🤍

📌 Example:
.calc 2+2
.calc 10*5
.calc (5+5)*2`

            }, { quoted: message });

        }

        // ======================
        // LOADING REACTION
        // ======================

        await react('⚡');

        // ======================
        // SAFE FILTER
        // ======================

        const allowed =
        /^[0-9+\-*/().%\s]+$/;

        if (!allowed.test(text)) {

            throw new Error(
                'Invalid characters'
            );

        }

        // ======================
        // CALCULATE
        // ======================

        const result =
        eval(text);

        // ======================
        // RESULT MESSAGE
        // ======================

        const resultMessage =

`*${text}=${result}*

> Powered By 𝐋ɪɴᴜх 𝐒ᴇʀ ⚡`;

        // ======================
        // SEND RESULT
        // ======================

        await sock.sendMessage(chatId, {

            text:
            resultMessage

        }, { quoted: message });

        // ======================
        // SUCCESS REACTION
        // ======================

        await react('✅');

    }

    catch (error) {

        console.error(
            'Calc Command Error:',
            error
        );

        // ======================
        // ERROR REACTION
        // ======================

        await sock.sendMessage(chatId, {

            react: {
                text: '❌',
                key: message.key
            }

        });

        // ======================
        // ERROR MESSAGE
        // ======================

        await sock.sendMessage(chatId, {

            text:
`❌ Invalid math expression

📌 Example: .calc 5+5`

        }, { quoted: message });

    }

}

module.exports = calcCommand;
