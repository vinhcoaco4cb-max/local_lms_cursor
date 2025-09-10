/**
 * QUIZZES/TRUEFALSE.JS — Логика для тестов "Верно/Неверно"
 */
QuizTypes.TrueFalse = {
    render(question) {
        const options = ['Верно', 'Неверно'].sort(() => Math.random() - 0.5);
        let html = '<div style="margin: 20px 0;">';
        options.forEach((option) => {
            html += `
                <div style="margin: 10px 0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="radio" name="answer" value="${option}" style="margin-right: 10px;">
                        ${option}
                    </label>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    init(question, nextBtn, onAnswer) {
        const radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                onAnswer(radio.value === 'Верно');
                nextBtn.disabled = false;
            });
        });
    },

    validate(question, userAnswer) {
        return question.correct[0] === (userAnswer ? 0 : 1);
    }
};