/**
 * QUIZZES/DRAGDROP.JS — Логика для тестов Drag & Drop
 * Добавлен режим "по категориям"
 */
QuizTypes.DragDrop = {
    render(question) {
      let html = '<div style="margin: 20px 0; display: flex; gap: 40px;">';
      
      if (question.type === 'dragdrop') {
        const items = [...question.items].sort(() => Math.random() - 0.5);
        const targets = [...question.targets];
        
        html += `
          <div style="flex: 1;">
            <h4>Перетащите элементы</h4>
            <div id="dragItems" style="min-height: 200px;">
              ${items.map((item) => `
                <div draggable="true" data-item="${item}" style="background: var(--background-alt); padding: 10px; margin: 5px 0; border-radius: 8px; cursor: move; border: 1px dashed var(--border);">
                  ${item}
                </div>
              `).join('')}
            </div>
          </div>
          <div style="flex: 1;">
            <h4>На соответствующие цели</h4>
            <div id="dropTargets">
              ${targets.map((target) => `
                <div data-target="${target}" style="background: var(--card-bg); padding: 10px; margin: 5px 0; border-radius: 8px; min-height: 50px; border: 2px solid var(--border);">
                  <div style="font-weight: bold; margin-bottom: 5px;">${target}</div>
                  <div class="drop-zone" style="min-height: 30px; background: rgba(0,0,0,0.05); border-radius: 4px;"></div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (question.type === 'dragdrop-categories') {
        const items = [...question.items].sort(() => Math.random() - 0.5);
        const categories = question.categories;
        
        html += `
          <div style="flex: 1;">
            <h4>Перетащите элементы</h4>
            <div id="dragItems" style="min-height: 200px;">
              ${items.map((item) => `
                <div draggable="true" data-item="${item}" style="background: var(--background-alt); padding: 10px; margin: 5px 0; border-radius: 8px; cursor: move; border: 1px dashed var(--border);">
                  ${item}
                </div>
              `).join('')}
            </div>
          </div>
          <div style="flex: 1;">
            <h4>Распределите по категориям</h4>
            <div id="dropCategories">
              ${categories.map((category) => `
                <div data-category="${category.name}" style="background: var(--card-bg); padding: 10px; margin: 5px 0; border-radius: 8px; min-height: 50px; border: 2px solid var(--border);">
                  <div style="font-weight: bold; margin-bottom: 5px;">${category.name}</div>
                  <div class="drop-zone" style="min-height: 30px; background: rgba(0,0,0,0.05); border-radius: 4px;"></div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      html += '</div>';
      return html;
    },

    init(question, nextBtn, onAnswer) {
        let userAnswers = {};
        const dragItems = document.querySelectorAll('#dragItems [draggable]');
        const allItemsCount = dragItems.length;

        dragItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.item);
            });
        });

        const dropZones = document.querySelectorAll('.drop-zone');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => e.preventDefault());
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemText = e.dataTransfer.getData('text/plain');
                const targetText = zone.closest('[data-target]')?.dataset.target || zone.closest('[data-category]')?.dataset.category;
                
                if (zone.children.length === 0) {
                    const droppedItem = document.createElement('div');
                    droppedItem.textContent = itemText;
                    droppedItem.style.backgroundColor = 'var(--success)';
                    droppedItem.style.color = 'white';
                    droppedItem.style.padding = '5px';
                    droppedItem.style.borderRadius = '4px';
                    zone.appendChild(droppedItem);
                    
                    userAnswers[itemText] = targetText;
                    onAnswer(userAnswers);
                    
                    if (Object.keys(userAnswers).length === allItemsCount) {
                        nextBtn.disabled = false;
                    }
                }
            });
        });
    },

    validate(question, userAnswers) {
        if (question.type === 'dragdrop') {
            const correctMappings = {};
            question.mappings.forEach(m => {
                correctMappings[m.item] = m.target;
            });
            return JSON.stringify(userAnswers) === JSON.stringify(correctMappings);
        } else if (question.type === 'dragdrop-categories') {
            let isCorrect = true;
            for (const item in userAnswers) {
                const categoryName = userAnswers[item];
                const correctCategory = question.categories.find(cat => cat.name === categoryName);
                if (!correctCategory || !correctCategory.correctItems.includes(item)) {
                    isCorrect = false;
                    break;
                }
            }
            return isCorrect && Object.keys(userAnswers).length === question.items.length;
        }
    }
};