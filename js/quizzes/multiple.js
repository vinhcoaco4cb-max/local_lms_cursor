/**
 * QUIZZES/MULTIPLE.JS — Логика для тестов с несколькими правильными ответами
 */
QuizTypes.multiple = {
    render(question) {
        const options = [...question.options].sort(() => Math.random() - 0.5);
        let html = '<fieldset>';
        options.forEach((option, index) => {
            html += `
                <label for="option_${index}">
                    <input type="checkbox" id="option_${index}" name="answer" value="${option}">
                    ${option}
                </label>
            `;
        });
        html += '</fieldset>';
        return html;
    },

    init(question, nextBtn, onAnswer) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selected = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                onAnswer(selected);
            });
        });
    },

    validate(question, userAnswers) {
        if (!userAnswers || userAnswers.length !== question.correct.length) {
            return false;
        }
        // Создаем множество правильных ответов для быстрой проверки
        const correctSet = new Set(question.correct.map(index => question.options[index]));
        // Проверяем, что каждый ответ пользователя есть в множестве правильных
        return userAnswers.every(answer => correctSet.has(answer));
    }
};
