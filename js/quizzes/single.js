/**
 * QUIZZES/SINGLE.JS — Логика для тестов с одним правильным ответом
 */
QuizTypes.single = {
    render(question) {
        const options = [...question.options].sort(() => Math.random() - 0.5);
        let html = '<div style="margin: 20px 0;">';
        console.log('QuizTypes.single defined and render called.'); // Добавляем лог
        options.forEach((option, index) => {
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
                onAnswer(radio.value);
                nextBtn.disabled = false;
            });
        });
    },

    validate(question, userAnswer) {
        return question.options[question.correct[0]] === userAnswer;
    }
};