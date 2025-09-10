/**
 * QUIZZES/SEQUENCE.JS — Логика для тестов на последовательность
 */
QuizTypes.Sequence = {
    render(question) {
        const steps = [...question.steps].map((step, index) => ({...step, originalIndex: index}))
            .sort(() => Math.random() - 0.5);
        
        let html = `
            <div style="margin: 20px 0;">
                <p>Расставьте шаги в правильном порядке:</p>
                <div id="sequenceContainer" style="margin-top: 20px;">
        `;
        
        steps.forEach((step) => {
            html += `
                <div draggable="true" data-index="${step.originalIndex}" style="background: var(--background-alt); padding: 15px; margin: 5px 0; border-radius: 8px; cursor: move; display: flex; align-items: center;">
                    ${step}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    },

    init(question, nextBtn, onAnswer) {
        const items = document.querySelectorAll('#sequenceContainer [draggable]');
        const container = document.getElementById('sequenceContainer');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.index);
                e.target.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
        container.addEventListener('dragover', (e) => e.preventDefault());
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector(`[data-index="${draggedIndex}"]`);
            
            let dropTarget = null;
            for (let item of items) {
                const rect = item.getBoundingClientRect();
                if (e.clientY < rect.bottom && e.clientY > rect.top) {
                    dropTarget = item;
                    break;
                }
            }
            
            if (dropTarget && dropTarget !== draggedElement) {
                container.insertBefore(draggedElement, dropTarget);
            }
            
            const newOrder = Array.from(container.children).map(el => parseInt(el.dataset.index));
            onAnswer(newOrder);
            nextBtn.disabled = false;
        });
    },

    validate(question, userOrder) {
        const correctOrder = question.steps.map((step, index) => index);
        return JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    }
};