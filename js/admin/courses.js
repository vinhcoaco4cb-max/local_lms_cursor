/**
 * ADMIN/COURSES.JS — Модуль управления курсами и уроками
 * Отвечает за: рендеринг вкладок, создание, редактирование и удаление курсов/уроков
 */
const AdminCourses = {
  // Текущее состояние
  state: {
    editingCourse: null,
    editingLesson: null,
  },
  
  // Вкладка "Курсы"
  renderTab() {
    const courses = Storage.getCourses();
    let html = `
      <header class="page-header">
          <hgroup>
              <h2>Управление курсами</h2>
              <p>Создавайте, редактируйте и управляйте учебными материалами.</p>
          </hgroup>
          <a href="#" role="button" onclick="event.preventDefault(); AdminCourses.createCourse()">+ Создать курс</a>
      </header>
    `;

    if (courses.length === 0) {
      html += `<article><p>Нет курсов. Создайте первый курс.</p></article>`;
    } else {
      courses.forEach(course => {
        html += `
          <article>
            <header>
              <div class="grid">
                <div>
                  <hgroup>
                    <h4>${course.title}</h4>
                    <p>${course.description || ''}</p>
                  </hgroup>
                  <small>Уроков: ${course.lessons.length}</small>
                </div>
                <div class="button-group">
                  <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.editCourse('${course.id}')">Редактировать</a>
                  <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminCourses.deleteCourse('${course.id}')">Удалить</a>
                </div>
              </div>
            </header>
            <label>
              <input type="checkbox" role="switch" ${course.lockUntilPassed ? 'checked' : ''} onchange="AdminCourses.toggleLock('${course.id}')">
              Блокировать следующий урок до прохождения
            </label>
            <hr>
            <div class="page-header">
              <h5>Уроки</h5>
              <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.createLesson('${course.id}')">+ Добавить урок</a>
            </div>
      `;

        if (course.lessons.length === 0) {
          html += `<p>Нет уроков. Добавьте первый урок.</p>`;
        } else {
          course.lessons.forEach(lesson => {
            html += `
              <article class="lesson-item-admin">
                <div class="lesson-item-content">
                  <strong>${lesson.title}</strong>
                  <div class="button-group">
                    <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.editLesson('${course.id}', '${lesson.id}')">Редактировать</a>
                    <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminCourses.deleteLesson('${course.id}', '${lesson.id}')">×</a>
                  </div>
                </div>
              </article>
            `;
          });
        }

        html += `</article>`;
      });
    }

    html += `
      <article>
        <h4>Экспорт/Импорт</h4>
        <div class="grid">
          <button onclick="Storage.exportCourses()">Экспорт курсов (JSON)</button>
          <button onclick="AdminCourses.importCourses()" class="secondary">Импорт курсов (JSON)</button>
        </div>
      </article>
    `;

    return html;
  },

  // Создание курса
  createCourse() {
    this.state.editingCourse = {
      id: Storage.generateId('course'),
      title: '',
      description: '',
      lockUntilPassed: true,
      lessons: []
    };
    this.editCourse(this.state.editingCourse.id);
  },

  // Редактирование курса
  editCourse(courseId) {
    const course = Storage.getCourses().find(c => c.id === courseId) || this.state.editingCourse;
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="page-header">
          <hgroup>
              <h2>${course.title ? 'Редактирование курса' : 'Создание курса'}</h2>
          </hgroup>
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.setTab('courses')">← Назад</a>
      </header>
      <article>
        <form id="courseForm">
          <label>
            Название курса *
            <input type="text" id="courseTitle" value="${course.title}" required>
          </label>
          <label>
            Описание
            <textarea id="courseDescription" rows="3">${course.description || ''}</textarea>
          </label>
          <label>
            <input type="checkbox" id="courseLock" role="switch" ${course.lockUntilPassed ? 'checked' : ''}>
            Блокировать следующий урок до прохождения
          </label>
          <footer class="form-footer">
            <button type="submit">Сохранить</button>
            <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.setTab('courses')">Отмена</a>
          </footer>
        </form>
      </article>
    `;

    document.getElementById('courseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('courseTitle').value.trim();
      const description = document.getElementById('courseDescription').value.trim();
      const lockUntilPassed = document.getElementById('courseLock').checked;

      if (!title) return;

      const updatedCourse = { ...course, title, description, lockUntilPassed };
      Storage.saveCourse(updatedCourse);
      Admin.setTab('courses');
    });
  },

  // Удаление курса
  deleteCourse(courseId) {
    if (confirm('Вы уверены, что хотите удалить курс и все его уроки?')) {
      Storage.deleteCourse(courseId);
      Admin.setTab('courses');
    }
  },

  // Переключение блокировки курса
  toggleLock(courseId) {
    const course = Storage.getCourses().find(c => c.id === courseId);
    if (course) {
      course.lockUntilPassed = !course.lockUntilPassed;
      Storage.saveCourse(course);
    }
  },

  // Создание урока
  createLesson(courseId) {
    this.state.editingLesson = {
      id: Storage.generateId('lesson'),
      title: '',
      content: ''
    };
    this.editLesson(courseId, this.state.editingLesson.id);
  },

  // Редактирование урока
  editLesson(courseId, lessonId) {
    const course = Storage.getCourses().find(c => c.id === courseId);
    const lesson = course.lessons.find(l => l.id === lessonId) || this.state.editingLesson;
    const quizzes = Storage.getQuizzes();
    const app = document.getElementById('app');

    let quizOptions = quizzes.map(q => `<option value="${q.id}">${q.title}</option>`).join('');

    app.innerHTML = `
      <header class="page-header">
        <hgroup>
          <h2>${lesson.title ? 'Редактирование' : 'Создание'} урока</h2>
        </hgroup>
        <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.setTab('courses')">← Назад к курсам</a>
      </header>
      <article>
        <form id="lessonForm">
          <label>
            Название урока *
            <input type="text" id="lessonTitle" value="${lesson.title}" required>
          </label>
          <label>
            Контент урока (Markdown + шорткоды)
            <textarea id="lessonContent" rows="10" class="monospace-font">${lesson.content || ''}</textarea>
            <small>
              Шорткоды: <code>[img:path/to/image.jpg]</code>, <code>[file:path/to/doc.pdf]</code>, <code>[video:path/to/video.mp4]</code>, <code>[quiz:quiz-id]</code>
            </small>
          </label>

          <hr>

          <fieldset>
              <legend>Прикрепленные тесты</legend>
              <div id="attached-quizzes-list"></div>
              <div class="grid">
                  <select id="quiz-to-attach">
                      <option value="">-- Выберите тест --</option>
                      ${quizOptions}
                  </select>
                  <button type="button" class="secondary" onclick="AdminCourses.attachQuiz()">Прикрепить тест</button>
              </div>
          </fieldset>

          <footer class="form-footer">
            <button type="submit">Сохранить урок</button>
            <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.setTab('courses')">Отмена</a>
          </footer>
        </form>
      </article>
    `;

    this.renderAttachedQuizzes();

    document.getElementById('lessonForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('lessonTitle').value.trim();
      const content = document.getElementById('lessonContent').value;

      if (!title) return;

      const updatedLesson = { ...lesson, title, content };
      
      // --- FIX STARTS HERE ---
      const courses = Storage.getCourses(); // Get the courses array
      const courseIndex = courses.findIndex(c => c.id === courseId);
      // --- FIX ENDS HERE ---
      
      if (courseIndex >= 0) {
        const lessonIndex = courses[courseIndex].lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex >= 0) {
          // --- FIX STARTS HERE ---
          courses[courseIndex].lessons[lessonIndex] = updatedLesson;
          // --- FIX ENDS HERE ---
        } else {
          // --- FIX STARTS HERE ---
          courses[courseIndex].lessons.push(updatedLesson);
          // --- FIX ENDS HERE ---
        }
        Storage.saveCourses();
      }

      Admin.setTab('courses');
    });
  },

  renderAttachedQuizzes() {
      const content = document.getElementById('lessonContent').value;
      const attachedList = document.getElementById('attached-quizzes-list');
      const quizIds = (content.match(/\[quiz:([^\]]+)\]/g) || []).map(q => q.slice(6, -1));

      if (quizIds.length === 0) {
          attachedList.innerHTML = '<p><small>К этому уроку еще не прикреплен ни один тест.</small></p>';
          return;
      }

      let html = '';
      quizIds.forEach(quizId => {
          const quiz = Storage.getQuiz(quizId);
          if(quiz) {
              html += `
                  <div class="attached-quiz-item">
                      <span>${quiz.title}</span>
                      <a href="#" onclick="event.preventDefault(); AdminCourses.detachQuiz('${quizId}')" class="contrast">Удалить</a>
                  </div>
              `;
          }
      });
      attachedList.innerHTML = html;
  },

  attachQuiz() {
      const select = document.getElementById('quiz-to-attach');
      const quizId = select.value;
      if (!quizId) return;

      const textarea = document.getElementById('lessonContent');
      const shortcode = `\n[quiz:${quizId}]`;

      if (textarea.value.includes(shortcode.trim())) {
          alert('Этот тест уже прикреплен.');
          return;
      }

      textarea.value += shortcode;
      select.value = ''; // Reset dropdown
      this.renderAttachedQuizzes();
  },

  detachQuiz(quizId) {
      const textarea = document.getElementById('lessonContent');
      const shortcodeRegex = new RegExp(`\\n?\\[quiz:${quizId}\\]`, 'g');
      textarea.value = textarea.value.replace(shortcodeRegex, '');
      this.renderAttachedQuizzes();
  },

  // Удаление урока
  deleteLesson(courseId, lessonId) {
    if (confirm('Вы уверены, что хотите удалить урок?')) {
      const course = Storage.getCourse(courseId);
      if (course) {
        course.lessons = course.lessons.filter(l => l.id !== lessonId);
        Storage.saveCourse(course);
        Admin.setTab('courses');
      }
    }
  },

  // Импорт курсов
  importCourses() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (Storage.importCourses(event.target.result)) {
            Admin.setTab('courses');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
};

