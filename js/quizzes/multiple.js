/**
 * QUIZZES/MULTIPLE.JS — Логика для тестов с несколькими правильными ответами
 */
QuizTypes.Multiple = {
    render(question) {
        const options = [...question.options].sort(() => Math.random() - 0.5);
        let html = '<div style="margin: 20px 0;">';
        options.forEach((option, index) => {
            html += `
                <div style="margin: 10px 0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" value="${option}" style="margin-right: 10px;">
                        ${option}
                    </label>
                </div>
            `;
        });
        html += '</div>';
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
                nextBtn.disabled = selected.length === 0;
            });
        });
    },

    validate(question, userAnswers) {
        if (!userAnswers || userAnswers.length !== question.correct.length) {
            return false;
        }
        const correctOptions = question.correct.map(index => question.options[index]);
        return userAnswers.every(answer => correctOptions.includes(answer));
    }
};