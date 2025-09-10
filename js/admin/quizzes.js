/**
 * ADMIN/QUIZZES.JS — Модуль управления тестами
 * Отвечает за: рендеринг вкладки, создание, редактирование и удаление тестов
 */
const AdminQuizzes = {
    state: {
      editingQuiz: null,
      currentCategoryFilter: '', // Добавляем состояние для фильтрации
    },
    
    renderTab() {
      const quizzes = Storage.getQuizzes();
      const categories = [...new Set(quizzes.map(quiz => quiz.category).filter(Boolean))];
  
      let categoryOptionsHtml = '<option value="">Все категории</option>';
      categories.forEach(category => {
        categoryOptionsHtml += `<option value="${category}" ${this.state.currentCategoryFilter === category ? 'selected' : ''}>${category}</option>`;
      });
  
      let html = `
        <div class="header-actions">
          <h3>Управление тестами</h3>
          <div class="button-group">
            <select id="quizCategoryFilter" class="select-field">
              ${categoryOptionsHtml}
            </select>
            <button onclick="AdminQuizzes.createQuiz()" class="btn btn-primary">+ Создать тест</button>
          </div>
        </div>
      `;
  
      const filteredQuizzes = this.state.currentCategoryFilter
        ? quizzes.filter(quiz => quiz.category === this.state.currentCategoryFilter)
        : quizzes;
  
      if (filteredQuizzes.length === 0) {
        html += `<p>Нет тестов. Создайте первый тест.</p>`;
      } else {
        html += `<div class="grid-gap-20">`;
        filteredQuizzes.forEach(quiz => {
          const firstQuestion = quiz.questions?.[0] || {};
          html += `
            <div class="card">
              <div class="card-header-actions">
                <div>
                  <h4>${quiz.title}</h4>
                  <p><strong>Количество вопросов:</strong> ${quiz.questions?.length || 0}</p>
                  <p><strong>Категория:</strong> ${quiz.category || 'Не указана'}</p>
                  <div class="quiz-info-grid mt-15">
                    <div><strong>Макс. балл:</strong> ${quiz.maxScore || 100}</div>
                    <div><strong>Проходной:</strong> ${quiz.passingScore || 80}%</div>
                    <div><strong>Попыток:</strong> ${quiz.maxAttempts === 0 ? '∞' : quiz.maxAttempts}</div>
                    <div><strong>Таймер:</strong> ${quiz.timeLimit > 0 ? quiz.timeLimit + ' сек' : 'Нет'}</div>
                  </div>
                </div>
                <div class="button-group">
                  <button onclick="AdminQuizzes.editQuiz('${quiz.id}')" class="btn btn-secondary">Редактировать</button>
                  <button onclick="AdminQuizzes.deleteQuiz('${quiz.id}')" class="btn btn-danger">Удалить</button>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
  
      html += `
        <div class="card mt-40">
          <h4>Экспорт/Импорт</h4>
          <div class="button-group mt-20">
            <button onclick="Storage.exportQuizzes()" class="btn btn-primary">Экспорт тестов (JSON)</button>
            <button onclick="AdminQuizzes.importQuizzes()" class="btn btn-secondary">Импорт тестов (JSON)</button>
          </div>
        </div>
      `;
  
      // Admin.app.innerHTML = html; // THIS LINE IS THE PROBLEM, SHOULD NOT BE HERE
      // No longer directly manipulating DOM or adding event listeners here
  
      return html; 
    },

    initEventListeners() {
      document.getElementById('quizCategoryFilter').addEventListener('change', (e) => {
        this.state.currentCategoryFilter = e.target.value;
        Admin.render();
      });
    },
  
    getQuizTypeLabel(type, getAll = false) {
      const labels = {
        'single': 'Один правильный ответ',
        'multiple': 'Несколько правильных ответов',
        'dragdrop': 'Перетаскивание (сопоставление)',
        'dragdrop-categories': 'Перетаскивание по категориям',
        'fillblank': 'Заполнение пропусков',
        'sequence': 'Установление последовательности',
        'hotspot': 'Клик по изображению',
        'hotspot-multiple': 'Hotspot: Множественные зоны',
        'hotspot-sequence': 'Hotspot: Последовательность',
        'truefalse': 'Верно/Неверно'
      };
      if (getAll) return labels;
      return labels[type] || type;
    },
  
    createQuiz() {
      this.state.editingQuiz = {
        id: Storage.generateId('quiz'),
        title: '',
        category: '',
        questions: [],
        maxScore: 100,
        timeLimit: 0,
        maxAttempts: 3,
        passingScore: 80,
        shuffle: true
      };
      this.editQuiz(this.state.editingQuiz.id);
    },
  
    editQuiz(quizId) {
      const quiz = Storage.getQuizzes().find(q => q.id === quizId) || this.state.editingQuiz;
      this.state.editingQuiz = quiz;
      const app = document.getElementById('app');
      
      let html = `
        <header class="admin-header">
          <button onclick="Admin.render()" class="btn btn-secondary">← Назад</button>
          <h2>${quiz.id === quizId ? 'Создание теста' : 'Редактирование теста'}</h2>
          <div></div>
        </header>
        <div class="container-narrow-large">
          <div class="card">
            <form id="quizForm">
              <div class="form-group">
                <label for="quizTitle">Название теста *</label>
                <input type="text" id="quizTitle" value="${quiz.title}" required>
              </div>
              <div class="form-group">
                <label for="quizCategory">Категория</label>
                <input type="text" id="quizCategory" value="${quiz.category || ''}" placeholder="Пожарная безопасность, HR и т.д.">
              </div>
              <div class="form-group">
                <label>Общие настройки</label>
                <div class="grid-cols-2 grid-gap-20 mt-10">
                  <div class="form-group no-mb">
                    <label for="quizMaxScore">Максимальный балл</label>
                    <input type="number" id="quizMaxScore" value="${quiz.maxScore || 100}" min="1">
                  </div>
                  <div class="form-group no-mb">
                    <label for="quizPassingScore">Проходной балл (%)</label>
                    <input type="number" id="quizPassingScore" value="${quiz.passingScore || 80}" min="0" max="100">
                  </div>
                  <div class="form-group no-mb">
                    <label for="quizMaxAttempts">Максимум попыток (0 = без ограничений)</label>
                    <input type="number" id="quizMaxAttempts" value="${quiz.maxAttempts || 3}" min="0">
                  </div>
                  <div class="form-group no-mb">
                    <label for="quizTimeLimit">Ограничение времени (сек, 0 = без ограничения)</label>
                    <input type="number" id="quizTimeLimit" value="${quiz.timeLimit || 0}" min="0">
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="flex-align-center-gap-10">
                  <input type="checkbox" id="quizShuffle" ${quiz.shuffle ? 'checked' : ''}>
                  Перемешивать вопросы и варианты
                </label>
              </div>
              <hr class="divider-lg">
              
              <div class="header-actions-mb-20">
                <h3>Вопросы</h3>
                <button type="button" onclick="AdminQuizzes.createQuestion()" class="btn btn-secondary">+ Добавить вопрос</button>
              </div>
  
              <div id="questionsContainer" class="grid-gap-20">
      `;
      
      (quiz.questions || []).forEach((question, index) => {
          html += `
            <div class="card card-quiz-question-item">
              <div class="card-header-actions-mb-15">
                <h4 class="no-mb">Вопрос #${index + 1} (${this.getQuizTypeLabel(question.type)})</h4>
                <div class="button-group compact">
                  <button type="button" onclick="AdminQuizzes.editQuestion(${index})" class="btn btn-secondary remove-button-compact">Редактировать</button>
                  <button type="button" onclick="AdminQuizzes.deleteQuestion(${index})" class="btn btn-danger remove-button-compact">×</button>
                </div>
              </div>
              <p>${question.question || question.text || 'Без текста'}</p>
            </div>
          `;
      });
  
      html += `
              </div>
              <div class="button-group mt-30">
                <button type="submit" class="btn btn-primary">Сохранить тест</button>
                <button type="button" onclick="Admin.render()" class="btn btn-secondary">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      `;
  
      app.innerHTML = html;
  
      document.getElementById('quizForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('quizTitle').value.trim();
        const category = document.getElementById('quizCategory').value.trim();
        const maxScore = parseInt(document.getElementById('quizMaxScore').value) || 100;
        const passingScore = parseInt(document.getElementById('quizPassingScore').value) || 80;
        const maxAttempts = parseInt(document.getElementById('quizMaxAttempts').value) || 0;
        const timeLimit = parseInt(document.getElementById('quizTimeLimit').value) || 0;
        const shuffle = document.getElementById('quizShuffle').checked;
  
        if (!title) return;
  
        let updatedQuiz = {
          ...quiz,
          title,
          category,
          maxScore,
          passingScore,
          maxAttempts,
          timeLimit,
          shuffle
        };
  
        Storage.saveQuiz(updatedQuiz);
        Admin.render();
      });
    },
    
    createQuestion() {
      if (!this.state.editingQuiz) return;
      this.showQuestionTypeSelectionModal(); // Вызываем модальное окно выбора типа
    },
  
    editQuestion(questionIndex) {
      if (!this.state.editingQuiz) return;
      const quiz = this.state.editingQuiz;
      const question = quiz.questions[questionIndex];
      const app = document.getElementById('app');
  
      let html = `
        <header class="admin-header">
          <button onclick="AdminQuizzes.editQuiz('${quiz.id}')" class="btn btn-secondary">← Назад к тесту</button>
          <h2>Редактирование вопроса #${questionIndex + 1}</h2>
          <div></div>
        </header>
        <div class="container-narrow-large">
          <div class="card">
            <form id="questionForm">
              <div class="form-group">
                <label for="questionType">Тип вопроса *</label>
                <select id="questionType" class="select-field" required>
                  <option value="single" ${question.type === 'single' ? 'selected' : ''}>Один правильный ответ</option>
                  <option value="multiple" ${question.type === 'multiple' ? 'selected' : ''}>Несколько правильных ответов</option>
                  <option value="dragdrop" ${question.type === 'dragdrop' ? 'selected' : ''}>Перетаскивание (сопоставление)</option>
                  <option value="dragdrop-categories" ${question.type === 'dragdrop-categories' ? 'selected' : ''}>Перетаскивание по категориям</option>
                  <option value="fillblank" ${question.type === 'fillblank' ? 'selected' : ''}>Заполнение пропусков</option>
                  <option value="sequence" ${question.type === 'sequence' ? 'selected' : ''}>Установление последовательности</option>
                  <option value="hotspot" ${question.type === 'hotspot' ? 'selected' : ''}>Клик по изображению</option>
                  <option value="hotspot-multiple" ${question.type === 'hotspot-multiple' ? 'selected' : ''}>Hotspot: Множественные зоны</option>
                  <option value="hotspot-sequence" ${question.type === 'hotspot-sequence' ? 'selected' : ''}>Hotspot: Последовательность</option>
                  <option value="truefalse" ${question.type === 'truefalse' ? 'selected' : ''}>Верно/Неверно</option>
                </select>
              </div>
      `;
  
      switch (question.type) {
        case 'single':
        case 'multiple':
        case 'truefalse':
          html += this.renderOptionsFields(question);
          break;
        case 'dragdrop':
          html += this.renderDragDropFields(question);
          break;
        case 'dragdrop-categories':
          html += this.renderDragDropCategoriesFields(question);
          break;
        case 'fillblank':
          html += this.renderFillBlankFields(question);
          break;
        case 'sequence':
          html += this.renderSequenceFields(question);
          break;
        case 'hotspot':
          html += this.renderHotspotFields(question);
          break;
        case 'hotspot-multiple':
          html += this.renderHotspotMultipleFields(question);
          break;
        case 'hotspot-sequence':
          html += this.renderHotspotSequenceFields(question);
          break;
      }
      
      html += `
              <div class="button-group mt-30">
                <button type="submit" class="btn btn-primary">Сохранить вопрос</button>
                <button type="button" onclick="AdminQuizzes.editQuiz('${quiz.id}')" class="btn btn-secondary">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      `;
  
      app.innerHTML = html;
  
      document.getElementById('questionType').addEventListener('change', (e) => {
          question.type = e.target.value;
          this.editQuestion(questionIndex);
      });
  
      document.getElementById('quizForm').addEventListener('submit', (e) => {
          e.preventDefault();
          let updatedQuestion = question;
          
          switch (question.type) {
            case 'single':
            case 'multiple':
            case 'truefalse':
              updatedQuestion = this.collectOptionsData(question);
              break;
            case 'dragdrop':
              updatedQuestion = this.collectDragDropData(question);
              break;
            case 'dragdrop-categories':
              updatedQuestion = this.collectDragDropCategoriesData(question);
              break;
            case 'fillblank':
              updatedQuestion = this.collectFillBlankData(question);
              break;
            case 'sequence':
              updatedQuestion = this.collectSequenceData(question);
              break;
            case 'hotspot':
              updatedQuestion = this.collectHotspotData(question);
              break;
            case 'hotspot-multiple':
              updatedQuestion = this.collectHotspotMultipleData(question);
              break;
            case 'hotspot-sequence':
              updatedQuestion = this.collectHotspotSequenceData(question);
              break;
          }
  
          quiz.questions[questionIndex] = updatedQuestion;
          this.state.editingQuiz.questions = quiz.questions;
          AdminQuizzes.editQuiz(quiz.id);
      });
    },
    
    deleteQuestion(questionIndex) {
      if (!this.state.editingQuiz) return;
      const quiz = this.state.editingQuiz;
      if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
        quiz.questions.splice(questionIndex, 1);
        this.editQuiz(quiz.id);
      }
    },
    
    renderOptionsFields(question) {
      let html = `
        <div class="form-group">
          <label for="questionQuestion">Вопрос *</label>
          <textarea id="questionQuestion" rows="2" required>${question.question || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Варианты ответов</label>
          <div id="optionsContainer">
      `;
  
      const options = question.options || [];
      const correct = question.correct || [];
      for (let i = 0; i < Math.max(options.length, 2); i++) {
        const option = options[i] || '';
        const isChecked = correct.includes(i);
        
        html += `
          <div class="quiz-option-item">
            <input type="text" class="option-input" value="${option}" placeholder="Вариант ответа">
            <label class="option-label-correct">
              <input type="${question.type === 'single' ? 'radio' : 'checkbox'}" class="option-correct" name="correct" value="${i}" ${isChecked ? 'checked' : ''}>
              ${question.type === 'single' ? 'Правильный' : 'Правильные'}
            </label>
            <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.quiz-option-item').remove()">×</button>
          </div>
        `;
      }
  
      html += `
          </div>
          <button type="button" onclick="AdminQuizzes.addOption()" class="btn btn-secondary mt-10">+ Добавить вариант</button>
        </div>
      `;
  
      return html;
    },
  
    addOption() {
      const container = document.getElementById('optionsContainer');
      const index = container.children.length;
      const div = document.createElement('div');
      div.className = 'quiz-option-item';
      
      const type = document.getElementById('questionType').value;
      const inputType = (type === 'single' || type === 'truefalse') ? 'radio' : 'checkbox';
      const labelText = (type === 'single' || type === 'truefalse') ? 'Правильный' : 'Правильные';
  
      div.innerHTML = `
        <input type="text" class="option-input" placeholder="Вариант ответа">
        <label class="option-label-correct">
          <input type="${inputType}" class="option-correct" name="correct" value="${index}">
          ${labelText}
        </label>
        <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.quiz-option-item').remove()">×</button>
      `;
      container.appendChild(div);
    },
    
    collectOptionsData(question) {
      const questionText = document.getElementById('questionQuestion').value.trim();
      const optionInputs = document.querySelectorAll('.option-input');
      const correctInputs = document.querySelectorAll('.option-correct:checked');
      
      const options = Array.from(optionInputs).map(input => input.value.trim()).filter(v => v);
      const correct = Array.from(correctInputs).map(input => parseInt(input.value));
      
      return {
        ...question,
        question: questionText,
        options,
        correct
      };
    },
    
    renderDragDropFields(question) {
      const mode = question.mode || 'match';
      let html = `
        <div class="form-group">
          <label>Вопрос *</label>
          <textarea id="questionQuestion" rows="2" required>${question.question || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Режим перетаскивания</label>
          <div class="drag-drop-mode-selector">
            <label class="flex-align-center-gap-5">
              <input type="radio" name="dragdropMode" value="match" ${mode === 'match' ? 'checked' : ''} onchange="AdminQuizzes.editQuestion(AdminQuizzes.state.editingQuiz.questions.indexOf(question))">
              Сопоставление 1:1
            </label>
            <label class="flex-align-center-gap-5">
              <input type="radio" name="dragdropMode" value="select" ${mode === 'select' ? 'checked' : ''} onchange="AdminQuizzes.editQuestion(AdminQuizzes.state.editingQuiz.questions.indexOf(question))">
              Выбор правильных
            </label>
          </div>
        </div>
      `;
  
      if (mode === 'match') {
        html += `
          <div class="form-group">
            <label>Элементы для перетаскивания</label>
            <div id="itemsContainer">
        `;
        
        const items = question.items || [];
        for (let i = 0; i < Math.max(items.length, 2); i++) {
          html += `
            <div class="drag-drop-item-row">
              <input type="text" class="drag-drop-item-input" value="${items[i] || ''}" placeholder="Элемент">
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-item-row').remove()">×</button>
            </div>
          `;
        }
        
        html += `
            </div>
            <button type="button" onclick="AdminQuizzes.addItem()" class="btn btn-secondary mt-10">+ Добавить элемент</button>
          </div>
          <div class="form-group">
            <label>Цели для сопоставления</label>
            <div id="targetsContainer">
        `;
        
        const targets = question.targets || [];
        for (let i = 0; i < Math.max(targets.length, 2); i++) {
          html += `
            <div class="drag-drop-item-row">
              <input type="text" class="drag-drop-item-input" value="${targets[i] || ''}" placeholder="Цель">
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-item-row').remove()">×</button>
            </div>
          `;
        }
        
        html += `
            </div>
            <button type="button" onclick="AdminQuizzes.addTarget()" class="btn btn-secondary mt-10">+ Добавить цель</button>
          </div>
          <div class="form-group">
            <label>Правильные сопоставления</label>
            <div id="mappingsContainer">
        `;
        
        const mappings = question.mappings || [];
        const currentItems = items.filter(i => i);
        const currentTargets = targets.filter(t => t);
        
        for (let i = 0; i < Math.min(currentItems.length, currentTargets.length); i++) {
          html += `
            <div class="drag-drop-mapping-row">
              <select class="drag-drop-mapping-select">
                ${currentItems.map((item, idx) => `<option value="${item}" ${mappings[i]?.item === item ? 'selected' : ''}>${item}</option>`).join('')}
              </select>
              <span class="drag-drop-mapping-arrow">→</span>
              <select class="drag-drop-mapping-select">
                ${currentTargets.map((target, idx) => `<option value="${target}" ${mappings[i]?.target === target ? 'selected' : ''}>${target}</option>`).join('')}
              </select>
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-mapping-row').remove()">×</button>
            </div>
          `;
        }
        
        html += `
            </div>
            <button type="button" onclick="AdminQuizzes.addMapping()" class="btn btn-secondary mt-10">+ Добавить сопоставление</button>
          </div>
        `;
      } else {
        html += `
          <div class="form-group">
            <label>Элементы для перетаскивания</label>
            <div id="itemsContainer">
        `;
        
        const items = question.items || [];
        const correctItems = question.correctItems || [];
        for (let i = 0; i < Math.max(items.length, 3); i++) {
          const isChecked = correctItems.includes(items[i]);
          html += `
            <div class="drag-drop-item-row">
              <input type="text" class="drag-drop-item-input" value="${items[i] || ''}" placeholder="Элемент">
              <label class="drag-drop-label-correct">
                <input type="checkbox" class="correct-item" ${isChecked ? 'checked' : ''}>
                Правильный
              </label>
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-item-row').remove()">×</button>
            </div>
          `;
        }
        
        html += `
            </div>
            <button type="button" onclick="AdminQuizzes.addItem()" class="btn btn-secondary mt-10">+ Добавить элемент</button>
          </div>
          <div class="form-group">
            <label>Цели (куда перетаскивать)</label>
            <div id="targetsContainer">
        `;
        
        const targets = question.targets || [];
        for (let i = 0; i < Math.max(targets.length, 1); i++) {
          html += `
            <div class="drag-drop-item-row">
              <input type="text" class="drag-drop-item-input" value="${targets[i] || ''}" placeholder="Цель">
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-item-row').remove()">×</button>
            </div>
          `;
        }
        
        html += `
            </div>
            <button type="button" onclick="AdminQuizzes.addTarget()" class="btn btn-secondary mt-10">+ Добавить цель</button>
          </div>
        `;
      }
  
      return html;
    },
  
    renderDragDropCategoriesFields(question) {
      let html = `
        <div class="form-group">
          <label>Вопрос *</label>
          <textarea id="questionQuestion" rows="2" required>${question.question || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Элементы для перетаскивания</label>
          <div id="itemsContainer">
      `;
      const items = question.items || [];
      items.forEach(item => {
        html += `
          <div class="drag-drop-item-row">
            <input type="text" class="drag-drop-item-input" value="${item}" placeholder="Элемент">
            <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.drag-drop-item-row').remove()">×</button>
          </div>
        `;
      });
      html += `
          </div>
          <button type="button" onclick="AdminQuizzes.addItem()" class="btn btn-secondary mt-10">+ Добавить элемент</button>
        </div>
        <div class="form-group">
          <label>Категории и правильные элементы</label>
          <div id="categoriesContainer">
      `;
      const categories = question.categories || [];
      categories.forEach((category, catIndex) => {
        html += `
          <div class="card category-card">
            <div class="category-header">
              <input type="text" class="category-name-input" value="${category.name}" placeholder="Название категории">
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.category-card').remove()">×</button>
            </div>
            <div class="category-items-container">
        `;
        category.correctItems.forEach(item => {
          html += `
            <div class="category-item-row">
              <input type="text" class="category-item-input" value="${item}" placeholder="Правильный элемент">
              <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.category-item-row').remove()">×</button>
            </div>
          `;
        });
        html += `
              <button type="button" onclick="AdminQuizzes.addCategoryItem(this)" class="btn btn-secondary mt-10">+ Добавить элемент</button>
            </div>
          </div>
        `;
      });
      html += `
          </div>
          <button type="button" onclick="AdminQuizzes.addCategory()" class="btn btn-secondary mt-10">+ Добавить категорию</button>
        </div>
      `;
      return html;
    },
  
    addCategory() {
      const container = document.getElementById('categoriesContainer');
      const newCategoryHtml = `
        <div class="card category-card">
          <div class="category-header">
            <input type="text" class="category-name-input" placeholder="Название категории">
            <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.category-card').remove()">×</button>
          </div>
          <div class="category-items-container">
            <button type="button" onclick="AdminQuizzes.addCategoryItem(this)" class="btn btn-secondary mt-10">+ Добавить элемент</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', newCategoryHtml);
    },
  
    addCategoryItem(button) {
      const container = button.closest('.category-items-container');
      const newItemHtml = `
        <div class="category-item-row">
          <input type="text" class="category-item-input" placeholder="Правильный элемент">
          <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.category-item-row').remove()">×</button>
        </div>
      `;
      button.insertAdjacentHTML('beforebegin', newItemHtml);
    },
  
    collectDragDropCategoriesData(question) {
      const questionText = document.getElementById('questionQuestion').value.trim();
      const items = Array.from(document.querySelectorAll('#itemsContainer .drag-drop-item-input')).map(input => input.value.trim()).filter(v => v);
      const categories = Array.from(document.querySelectorAll('#categoriesContainer .category-card')).map(card => {
        const name = card.querySelector('.category-name-input').value.trim();
        const correctItems = Array.from(card.querySelectorAll('.category-item-input')).map(input => input.value.trim()).filter(v => v);
        return { name, correctItems };
      });
      return { ...question, question: questionText, items, categories };
    },
    
    renderHotspotMultipleFields(question) {
      let html = `
        <div class="form-group">
          <label for="questionImage">URL изображения *</label>
          <input type="text" id="questionImage" value="${question.image || ''}" placeholder="files/path/to/image.jpg" required>
          <div class="hotspot-image-preview mt-10">
            <img id="previewImage" src="${question.image || ''}" alt="Preview" style="display: ${question.image ? 'block' : 'none'};">
          </div>
        </div>
        <div class="form-group">
          <label>Зоны для клика (отметьте все правильные)</label>
          <div id="zonesContainer">
      `;
      const zones = question.zones || [];
      zones.forEach((zone, index) => {
        html += `
          <div class="hotspot-zone-item">
            <span class="hotspot-zone-label">Зона ${index + 1}: X=${zone.x}, Y=${zone.y}, Tolerance=${zone.tolerance}</span>
            <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.hotspot-zone-item').remove()">×</button>
          </div>
        `;
      });
      html += `
          </div>
          <button type="button" id="setZonesBtn" class="btn btn-secondary mt-10">Задать зоны на изображении</button>
        </div>
      `;
      return html;
    },
  
    collectHotspotMultipleData(question) {
      const image = document.getElementById('questionImage').value.trim();
      const zones = []; // Зоны будут собираться интерактивно
      return { ...question, image, zones };
    },
  
    renderHotspotSequenceFields(question) {
      let html = `
        <div class="form-group">
          <label for="questionImage">URL изображения *</label>
          <input type="text" id="questionImage" value="${question.image || ''}" placeholder="files/path/to/image.jpg" required>
          <div class="hotspot-image-preview mt-10">
            <img id="previewImage" src="${question.image || ''}" alt="Preview" style="display: ${question.image ? 'block' : 'none'};">
          </div>
        </div>
        <div class="form-group">
          <label>Зоны для клика (отметьте в правильном порядке)</label>
          <div id="zonesContainer">
      `;
      const zones = question.zones || [];
      zones.forEach((zone, index) => {
        html += `
          <div class="hotspot-zone-item">
            <span class="hotspot-zone-label">Зона ${index + 1}: X=${zone.x}, Y=${zone.y}, Tolerance=${zone.tolerance}</span>
            <button type="button" class="btn btn-danger remove-button-compact" onclick="this.closest('.hotspot-zone-item').remove()">×</button>
          </div>
        `;
      });
      html += `
          </div>
          <button type="button" id="setZonesBtn" class="btn btn-secondary mt-10">Задать зоны на изображении</button>
        </div>
      `;
      return html;
    },
  
    collectHotspotSequenceData(question) {
      const image = document.getElementById('questionImage').value.trim();
      const zones = []; // Зоны будут собираться интерактивно
      return { ...question, image, zones };
    },
  
    deleteQuiz(quizId) {
      if (confirm('Вы уверены, что хотите удалить тест?')) {
        Storage.deleteQuiz(quizId);
        Admin.render();
      }
    },

    // Вставка теста в урок
    insertQuiz(courseId) {
      const quizzes = Storage.getQuizzes();
      let quizListHtml = '';

      if (quizzes.length === 0) {
        quizListHtml = '<p>Нет доступных тестов. Создайте тесты на вкладке "Тесты"</p>';
      } else {
        quizListHtml += '<div class="grid-gap-10">';
        quizzes.forEach(quiz => {
          quizListHtml += `
            <button class="btn btn-secondary justify-content-start" onclick="AdminQuizzes.selectQuizForLesson('${courseId}', '${quiz.id}')">
              ${quiz.title} (${quiz.questions?.length || 0} вопросов)
            </button>
          `;
        });
        quizListHtml += '</div>';
      }

      Modals.showModal(`
        <div class="modal-content-padding">
          <h3>Выберите тест для вставки</h3>
          ${quizListHtml}
          <button onclick="Modals.closeModal()" class="btn btn-secondary mt-20">Отмена</button>
        </div>
      `);
    },

    // Выбор теста для урока
    selectQuizForLesson(courseId, quizId) {
      const lessonContentTextarea = document.getElementById('lessonContent');
      if (lessonContentTextarea) {
        const quizShortcode = `[quiz:${quizId}]`;
        const currentContent = lessonContentTextarea.value;
        
        // Проверяем, есть ли уже этот тест в контенте
        if (currentContent.includes(quizShortcode)) {
            alert('Этот тест уже добавлен в урок.');
            Modals.closeModal();
            return;
        }

        // Добавляем шорткод в конец контента
        lessonContentTextarea.value = currentContent + '\n\n' + quizShortcode;
      }
      Modals.closeModal();
      // Не нужно сохранять урок здесь, так как пользователь должен сам нажать 'Сохранить'
      // AdminCourses.editLesson(courseId, AdminCourses.state.editingLesson.id); 
    },
  
    importQuizzes() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            Storage.importQuizzes(event.target.result);
            Admin.render();
          };
          reader.readAsText(file);
        }
      };
      input.click();
    },

    // Показывает модальное окно для выбора типа вопроса при создании
    showQuestionTypeSelectionModal() {
      let htmlContent = `
        <div class="modal-content-padding">
          <h3>Выберите тип вопроса</h3>
          <div class="grid-gap-10 mt-20">
      `;
  
      // Получаем все возможные типы вопросов из getQuizTypeLabel
      const quizTypes = Object.keys(this.getQuizTypeLabel(null, true)); // Передаем true, чтобы получить все типы
  
      quizTypes.forEach(type => {
        htmlContent += `
          <button class="btn btn-secondary justify-content-start" onclick="AdminQuizzes.selectQuestionTypeAndCreate('${type}')">
            ${this.getQuizTypeLabel(type)}
          </button>
        `;
      });
  
      htmlContent += `
          </div>
          <button onclick="Modals.closeModal()" class="btn btn-secondary mt-20">Отмена</button>
        </div>
      `;
  
      Modals.showModal(htmlContent);
    },
  
    // Создает новый вопрос выбранного типа и открывает его для редактирования
    selectQuestionTypeAndCreate(type) {
      if (!this.state.editingQuiz) return;
  
      const newQuestion = {
        type: type,
        question: '',
        options: [],
        correct: [],
        // Добавьте другие свойства по умолчанию для разных типов, если необходимо
      };
  
      const quiz = this.state.editingQuiz;
      if (!quiz.questions) quiz.questions = [];
      quiz.questions.push(newQuestion);
      Modals.closeModal(); // Закрываем модальное окно
      this.editQuestion(quiz.questions.length - 1);
    }
  };