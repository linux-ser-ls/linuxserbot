const axios = require('axios');

let triviaGames = {};

async function startTrivia(sock, chatId) {
    if (triviaGames[chatId]) {
        sock.sendMessage(chatId, {
text:
`⚠️ A trivia game is already running!

🎮 Answer the current question before starting a new one.`
});
        return;
    }

    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const questionData = response.data.results[0];

        triviaGames[chatId] = {
            question: questionData.question,
            correctAnswer: questionData.correct_answer,
            options: [...questionData.incorrect_answers, questionData.correct_answer].sort(),
        };

        sock.sendMessage(chatId, {
text:
`🧠 Trivia Challenge

❓ Question:
${triviaGames[chatId].question}

📚 Options:

${triviaGames[chatId].options.map((opt, i) =>
"${['1️⃣','2️⃣','3️⃣','4️⃣'][i]} ${opt}"
).join('\n')}

💡 Answer using:

.answer <your answer>

Example:
.answer ${triviaGames[chatId].options[0]}

⏳ Good luck 🍀`
});
    } catch (error) {
        sock.sendMessage(chatId, { text: 'Error fetching trivia question. Try again later.' });
    }
}

function answerTrivia(sock, chatId, answer) {
    if (!triviaGames[chatId]) {
        sock.sendMessage(chatId, {
text:
`⚠️ No trivia game is currently active.

🎮 Start a new game using the trivia command.`
});
        return;
    }

    const game = triviaGames[chatId];

    if (answer.toLowerCase() === game.correctAnswer.toLowerCase()) {
        sock.sendMessage(chatId, {
text:
`✅ Correct Answer!

🎉 Great job!

🏆 Answer:
${game.correctAnswer}

✨ Well played!`
});
    } else {
        sock.sendMessage(chatId, {
text:
`❌ Wrong Answer!

😅 Nice try!

✅ Correct Answer:
${game.correctAnswer}

🎯 Better luck next time!`
});
    }

    delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };
