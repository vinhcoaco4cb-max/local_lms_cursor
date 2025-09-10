/**
 * QUIZZES/FILLBLANK.JS — Логика для тестов с заполнением пропусков
 */
QuizTypes.FillBlank = {
    render(question) {
        return `
            <div style="margin: 20px 0;">
                <p>${question.text.replace('___', '<input type="text" id="fillBlankInput" placeholder="Введите ответ" style="padding: 8px; border: 1px solid var(--border); border-radius: 4px; margin: 0 5px; min-width: 100px;">')}</p>
            </div>
        `;
    },

    init(question, nextBtn, onAnswer) {
        const input = document.getElementById('fillBlankInput');
        input.addEventListener('input', () => {
            onAnswer(input.value.trim());
            nextBtn.disabled = input.value.trim() === '';
        });
    },

    validate(question, userAnswer) {
        const correctAnswers = question.correctAnswers.map(a => a.toLowerCase());
        return correctAnswers.includes(userAnswer.toLowerCase());
    }
};