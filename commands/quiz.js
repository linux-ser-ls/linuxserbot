const quizPolls = {};

const quizQuestions = [
{
question: "Which language runs in the browser?",
options: ["Python", "Java", "JavaScript", "C++"],
correct: "JavaScript",
explanation: "JavaScript is the primary programming language used in web browsers."
},
{
question: "Who founded Microsoft?",
options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
correct: "Bill Gates",
explanation: "Microsoft was founded by Bill Gates and Paul Allen in 1975."
},
{
question: "What does CPU stand for?",
options: [
"Central Process Unit",
"Central Processing Unit",
"Computer Processing Unit",
"Central Program Unit"
],
correct: "Central Processing Unit",
explanation: "CPU stands for Central Processing Unit, the brain of a computer."
}
];

async function startQuizPoll(sock, chatId) {
const quiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];

quizPolls[chatId] = quiz;

await sock.sendMessage(chatId, {
    poll: {
        name: `🧠 QUIZ TIME\n\n${quiz.question}`,
        values: quiz.options,
        selectableCount: 1
    }
});

await sock.sendMessage(chatId, {
text: `📊 Vote in the poll above.

⏳ After everyone votes, use:
.quizanswer

to reveal the correct answer and explanation.`
});
}

async function revealQuizAnswer(sock, chatId) {
const quiz = quizPolls[chatId];

if (!quiz) {
return sock.sendMessage(chatId, {
text: "❌ No active quiz poll."
});
}

await sock.sendMessage(chatId, {
text: `🧠 QUIZ RESULT

❓ Question:
${quiz.question}

✅ Correct Answer: ${quiz.correct}

📚 Explanation:
${quiz.explanation}

🎮 Start another quiz with:
.quiz`
});

delete quizPolls[chatId];
}

module.exports = {
startQuizPoll,
revealQuizAnswer
};
