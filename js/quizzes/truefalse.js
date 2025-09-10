/**
 * QUIZZES/TRUEFALSE.JS — Логика для тестов "Верно/Неверно"
 */
QuizTypes.truefalse = {
    render(question) {
        return `
            <fieldset>
                <label for="true_option">
                    <input type="radio" id="true_option" name="answer" value="true">
                    Верно
                </label>
                <label for="false_option">
                    <input type="radio" id="false_option" name="answer" value="false">
                    Неверно
                </label>
            </fieldset>
        `;
    },

    init(question, nextBtn, onAnswer) {
        const radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                onAnswer(radio.value === 'true');
            });
        });
    },

    validate(question, userAnswer) {
        const isCorrectAnswerTrue = question.correct[0] === 0;
        return isCorrectAnswerTrue === userAnswer;
    }
};
