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
      <header class="page-header">
          <hgroup>
              <h2>Управление тестами</h2>
              <p>Создавайте и настраивайте тесты для проверки знаний.</p>
          </hgroup>
          <div class="header-controls">
              <select id="quizCategoryFilter">
                ${categoryOptionsHtml}
              </select>
              <a href="#" role="button" onclick="event.preventDefault(); AdminQuizzes.createQuiz()">+ Создать тест</a>
          </div>
      </header>
    `;

    const filteredQuizzes = this.state.currentCategoryFilter
      ? quizzes.filter(quiz => quiz.category === this.state.currentCategoryFilter)
      : quizzes;

    if (filteredQuizzes.length === 0) {
      html += `<article><p>Нет тестов. Создайте первый тест.</p></article>`;
    } else {
      filteredQuizzes.forEach(quiz => {
        html += `
          <article>
            <div class="grid">
              <div>
                <hgroup>
                  <h4>${quiz.title}</h4>
                  <p>Категория: ${quiz.category || 'Не указана'}</p>
                </hgroup>
                <div class="quiz-info-grid">
                  <small>Вопросов: ${quiz.questions?.length || 0}</small>
                  <small>Проходной балл: ${quiz.passingScore || 80}%</small>
                  <small>Попыток: ${quiz.maxAttempts === 0 ? '∞' : quiz.maxAttempts}</small>
                  <small>Таймер: ${quiz.timeLimit > 0 ? quiz.timeLimit + ' сек' : 'Нет'}</small>
                </div>
              </div>
              <div class="button-group">
                <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminQuizzes.editQuiz('${quiz.id}')">Редактировать</a>
                <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminQuizzes.deleteQuiz('${quiz.id}')">Удалить</a>
              </div>
            </div>
          </article>
        `;
      });
    }

    html += `
      <article>
        <h4>Экспорт/Импорт</h4>
        <div class="grid">
          <button onclick="Storage.exportQuizzes()">Экспорт тестов (JSON)</button>
          <button onclick="AdminQuizzes.importQuizzes()" class="secondary">Импорт тестов (JSON)</button>
        </div>
      </article>
    `;

    return html; 
  },

  initEventListeners() {
      const filter = document.getElementById('quizCategoryFilter');
      if (filter) {
          filter.addEventListener('change', (e) => {
              this.state.currentCategoryFilter = e.target.value;
              Admin.render();
          });
      }
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
      <header class="page-header">
          <hgroup>
              <h2>${quiz.id === quizId ? 'Создание теста' : 'Редактирование теста'}</h2>
              <p>Настройте параметры теста и добавьте вопросы.</p>
          </hgroup>
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">← Назад</a>
      </header>
      <article>
        <form id="quizForm">
          <label for="quizTitle">
            Название теста *
            <input type="text" id="quizTitle" value="${quiz.title}" required>
          </label>
          <label for="quizCategory">
            Категория
            <input type="text" id="quizCategory" value="${quiz.category || ''}" placeholder="Пожарная безопасность, HR и т.д.">
          </label>
          <div class="grid">
              <label for="quizMaxScore">
                  Макс. балл
                  <input type="number" id="quizMaxScore" value="${quiz.maxScore || 100}" min="1">
              </label>
              <label for="quizPassingScore">
                  Проходной балл (%)
                  <input type="number" id="quizPassingScore" value="${quiz.passingScore || 80}" min="0" max="100">
              </label>
          </div>
          <div class="grid">
              <label for="quizMaxAttempts">
                  Макс. попыток (0 = ∞)
                  <input type="number" id="quizMaxAttempts" value="${quiz.maxAttempts || 3}" min="0">
              </label>
              <label for="quizTimeLimit">
                  Таймер (сек, 0 = ∞)
                  <input type="number" id="quizTimeLimit" value="${quiz.timeLimit || 0}" min="0">
              </label>
          </div>
          <label>
            <input type="checkbox" id="quizShuffle" role="switch" ${quiz.shuffle ? 'checked' : ''}>
            Перемешивать вопросы и варианты
          </label>
          <hr>
          
          <header class="page-header">
            <h3>Вопросы</h3>
            <a href="#" role="button" class="secondary" onclick="event.preventDefault(); AdminQuizzes.createQuestion()">+ Добавить вопрос</a>
          </header>
          <div id="questionsContainer" class="grid-gap-20">
    `;
    
    (quiz.questions || []).forEach((question, index) => {
        html += `
          <article class="question-admin-item">
              <hgroup>
                  <h5>Вопрос #${index + 1} (${this.getQuizTypeLabel(question.type)})</h5>
                  <p>${question.question || question.text || 'Без текста'}</p>
              </hgroup>
              <footer>
                  <div class="button-group">
                      <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminQuizzes.editQuestion(${index})">Редактировать</a>
                      <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminQuizzes.deleteQuestion(${index})">×</a>
                  </div>
              </footer>
          </article>
        `;
    });

    html += `
          </div>
          <footer class="form-footer">
              <button type="submit">Сохранить тест</button>
              <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">Отмена</a>
          </footer>
        </form>
      </article>
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
        ...(this.state.editingQuiz || {}),
        title,
        category,
        maxScore,
        passingScore,
        maxAttempts,
        timeLimit,
        shuffle
      };

      Storage.saveQuiz(updatedQuiz);
      Admin.setTab('quizzes');
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
      <header class="page-header">
          <hgroup>
              <h2>Редактирование вопроса #${questionIndex + 1}</h2>
              <p>Выберите тип вопроса и заполните его содержание.</p>
          </hgroup>
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); AdminQuizzes.editQuiz('${quiz.id}')">← Назад к тесту</a>
      </header>
      <article>
        <form id="questionForm">
          <label for="questionType">
            Тип вопроса *
            <select id="questionType" required>
              <option value="single" ${question.type === 'single' ? 'selected' : ''}>Один правильный ответ</option>
              <option value="multiple" ${question.type === 'multiple' ? 'selected' : ''}>Несколько правильных ответов</option>
              <option value="truefalse" ${question.type === 'truefalse' ? 'selected' : ''}>Верно/Неверно</option>
              <option value="fillblank" ${question.type === 'fillblank' ? 'selected' : ''}>Заполнение пропусков</option>
              <!-- More types can be added here -->
            </select>
          </label>
    `;

    // The rest of the form fields will be dynamically rendered based on type
    html += `<div id="dynamic-fields">`;
    html += this.renderQuestionFields(question);
    html += `</div>`;
    
    html += `
          <footer class="form-footer">
              <button type="submit">Сохранить вопрос</button>
              <a href="#" role="button" class="secondary" onclick="event.preventDefault(); AdminQuizzes.editQuiz('${quiz.id}')">Отмена</a>
          </footer>
        </form>
      </article>
    `;

    app.innerHTML = html;

    document.getElementById('questionType').addEventListener('change', (e) => {
        const newType = e.target.value;
        const oldQuestionData = this.collectQuestionData(question.type);
        const newQuestion = { ...oldQuestionData, type: newType, options: [], correct: [] }; // Reset options/correct on type change
        quiz.questions[questionIndex] = newQuestion;
        this.editQuestion(questionIndex);
    });

    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedQuestion = this.collectQuestionData(question.type);

        quiz.questions[questionIndex] = updatedQuestion;
        this.state.editingQuiz.questions = quiz.questions;
        Storage.saveQuiz(this.state.editingQuiz);
        AdminQuizzes.editQuiz(quiz.id);
    });
  },

  renderQuestionFields(question) {
      switch (question.type) {
          case 'single':
          case 'multiple':
          case 'truefalse':
            return this.renderOptionsFields(question);
          // Other cases will be added here
          default:
            return '';
      }
  },

  collectQuestionData(type) {
      switch (type) {
          case 'single':
          case 'multiple':
          case 'truefalse':
            return this.collectOptionsData({ type });
          // Other cases will be added here
          default:
            return { type };
      }
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
      <label for="questionText">
        Текст вопроса *
        <textarea id="questionText" rows="2" required>${question.question || ''}</textarea>
      </label>
      <fieldset id="optionsContainer">
        <legend>Варианты ответов</legend>
    `;
    
    const options = question.type === 'truefalse' ? ['Верно', 'Неверно'] : (question.options || []);
    const correct = question.correct || [];
    const inputType = question.type === 'single' || question.type === 'truefalse' ? 'radio' : 'checkbox';

    for (let i = 0; i < Math.max(options.length, 2); i++) {
      const optionText = options[i] || '';
      const isChecked = correct.includes(i);
      
      html += `
        <div class="option-item">
          <input type="${inputType}" name="correct" value="${i}" id="option_${i}" ${isChecked ? 'checked' : ''}>
          <input type="text" class="option-input" value="${optionText}" placeholder="Текст ответа" ${question.type === 'truefalse' ? 'readonly' : ''}>
          ${question.type !== 'truefalse' ? `<button type="button" class="contrast outline" onclick="this.closest('.option-item').remove()">×</button>` : ''}
        </div>
      `;
    }

    html += `
      </fieldset>
      ${question.type !== 'truefalse' ? `<a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminQuizzes.addOption()">+ Добавить вариант</a>` : ''}
    `;

    return html;
  },

  addOption() {
    const container = document.getElementById('optionsContainer');
    const index = container.querySelectorAll('.option-item').length;
    const div = document.createElement('div');
    div.className = 'option-item';
    
    const type = document.getElementById('questionType').value;
    const inputType = (type === 'single' || type === 'truefalse') ? 'radio' : 'checkbox';

    div.innerHTML = `
      <input type="${inputType}" name="correct" value="${index}" id="option_${index}">
      <input type="text" class="option-input" placeholder="Текст ответа">
      <button type="button" class="contrast outline" onclick="this.closest('.option-item').remove()">×</button>
    `;
    container.appendChild(div);
  },
  
  collectOptionsData(question) {
    const questionText = document.getElementById('questionText').value.trim();
    const optionInputs = document.querySelectorAll('.option-input');
    const correctInputs = document.querySelectorAll(`input[name="correct"]:checked`);
    
    const options = Array.from(optionInputs).map(input => input.value.trim()).filter(v => v);
    const correct = Array.from(correctInputs).map(input => parseInt(input.value));
    
    return {
      ...question,
      question: questionText,
      options,
      correct
    };
  },
  
  deleteQuiz(quizId) {
    if (confirm('Вы уверены, что хотите удалить тест?')) {
      Storage.deleteQuiz(quizId);
      Admin.render();
    }
  },

  insertQuiz(courseId) {
    const quizzes = Storage.getQuizzes();
    let quizListHtml = '';

    if (quizzes.length === 0) {
      quizListHtml = '<p>Нет доступных тестов. Создайте их на вкладке "Тесты".</p>';
    } else {
      quizListHtml += '<div class="grid">';
      quizzes.forEach(quiz => {
        quizListHtml += `
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); AdminQuizzes.selectQuizForLesson('${courseId}', '${quiz.id}')">
            ${quiz.title} <small>(${quiz.questions?.length || 0} вопр.)</small>
          </a>
        `;
      });
      quizListHtml += '</div>';
    }

    Modals.showModal(`
      <hgroup>
          <h3>Выберите тест для вставки</h3>
          <p>Шорткод теста будет добавлен в конец урока.</p>
      </hgroup>
      ${quizListHtml}
    `);
  },
  
  selectQuizForLesson(courseId, quizId) {
    const lessonContentTextarea = document.getElementById('lessonContent');
    if (lessonContentTextarea) {
      const quizShortcode = `\n[quiz:${quizId}]`;
      lessonContentTextarea.value += quizShortcode;
      lessonContentTextarea.focus();
      lessonContentTextarea.scrollTop = lessonContentTextarea.scrollHeight;
    }
    Modals.closeModal();
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

  showQuestionTypeSelectionModal() {
    let htmlContent = `<hgroup><h3>Выберите тип вопроса</h3><p>Это определит, как пользователь будет на него отвечать.</p></hgroup><div class="grid">`;

    const quizTypes = this.getQuizTypeLabel(null, true);

    for (const type in quizTypes) {
      htmlContent += `
        <a href="#" role="button" class="secondary" onclick="event.preventDefault(); AdminQuizzes.selectQuestionTypeAndCreate('${type}')">
          ${quizTypes[type]}
        </a>
      `;
    }

    htmlContent += `</div>`;
    Modals.showModal(htmlContent);
  },

  selectQuestionTypeAndCreate(type) {
    if (!this.state.editingQuiz) return;

    const newQuestion = { type: type };
    
    const quiz = this.state.editingQuiz;
    if (!quiz.questions) quiz.questions = [];
    quiz.questions.push(newQuestion);
    Modals.closeModal();
    this.editQuestion(quiz.questions.length - 1);
  }
};
