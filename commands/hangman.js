const fs = require('fs');

const words = [ { word: "javascript", hint: "Programming language" },
                { word: "whatsapp", hint: "Popular messaging app" }, 
                { word: "telegram", hint: "Cloud messaging platform" }, 
                { word: "computer", hint: "Electronic device" }, 
                { word: "internet", hint: "Global network" }, 
                { word: "hangman", hint: "Word guessing game" }, 
                { word: "developer", hint: "Person who writes code" } 
              ];
let hangmanGames = {};

function startHangman(sock, chatId) {
    const selected = words[Math.floor(Math.random() * words.length)];
const word = selected.word;
const hint = selected.hint;
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, {
    text: `🎮 *HANGMAN GAME STARTED* 🎮

📝 *Guess the hidden word by entering one letter at a time.*

💡 *Hint:*
${hint}

🔤 *Word:*${maskedWord}

📖 *How to Play:*
• Guess one letter at a time.
• Correct letters will be revealed.
• Wrong letters reduce your chances.
• You have *6 wrong attempts*.
• Guess the full word before your chances run out.

💬 *Examples:*
.guess a
.guess e
.guess t

🏆 *Win:* Reveal the complete word.
💀 *Lose:* Use all 6 wrong guesses.

🎯 Good luck!`
});
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: 'No game in progress. Start a new game with .hangman' });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, {
    text: `⚠️ You already guessed *"${letter}"*

Try a different letter.

📌 Guessed Letters:
${guessedLetters.join(', ')}`
});
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }
        sock.sendMessage(chatId, {
    text: `✅ *Correct Guess!*

🔤 Word:
${maskedWord.join(' ')}

📌 Guessed Letters:
${guessedLetters.join(', ')}

🎯 Keep going!`
});

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, {
    text: `🎉 *CONGRATULATIONS!* 🎉

🏆 You guessed the word successfully!

🔤 Word: ${word}

🥳 You Win!`
});
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, {
    text: `❌ *Wrong Guess!*

🔠 Letter: ${letter}

❤️ Chances Left:
${maxWrongGuesses - game.wrongGuesses}/6

📌 Guessed Letters:
${guessedLetters.join(', ')}

🔤 Current Word:
${maskedWord.join(' ')}`
});

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, {
    text: `💀 *GAME OVER*

❌ No chances remaining.

🔤 The word was:
${word}

🎮 Start a new game with:
.hangman`
});
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
