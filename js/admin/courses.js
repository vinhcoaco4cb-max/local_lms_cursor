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
                      <label class="mt-15">
                          <input type="checkbox" role="switch" ${course.lockUntilPassed ? 'checked' : ''} onchange="AdminCourses.toggleLock('${course.id}')">
                          Блокировать следующий урок до прохождения
                      </label>
                  </div>
                  <div style="text-align: right;">
                      <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.editCourse('${course.id}')">Редактировать</a>
                      <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminCourses.deleteCourse('${course.id}')">Удалить</a>
                  </div>
              </div>
            </header>
            
            <details>
              <summary>Уроки</summary>
              <div>
                  <header class="page-header">
                      <h5>Список уроков</h5>
                      <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.createLesson('${course.id}')">+ Добавить урок</a>
                  </header>
        `;

        if (course.lessons.length === 0) {
          html += `<p>Нет уроков. Добавьте первый урок.</p>`;
        } else {
          course.lessons.forEach(lesson => {
            html += `
              <article class="lesson-admin-item">
                <strong>${lesson.title}</strong>
                <div class="button-group">
                  <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminCourses.editLesson('${course.id}', '${lesson.id}')">Изменить</a>
                  <a href="#" role="button" class="contrast outline" onclick="event.preventDefault(); AdminCourses.deleteLesson('${course.id}', '${lesson.id}')">×</a>
                </div>
              </article>
            `;
          });
        }

        html += `
              </div>
            </details>
          </article>
        `;
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
          <h2>${courseId === this.state.editingCourse?.id ? 'Создание курса' : 'Редактирование курса'}</h2>
          <p>Заполните основную информацию о курсе.</p>
        </hgroup>
        <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">← Назад</a>
      </header>
      <article>
        <form id="courseForm">
          <label for="courseTitle">
            Название курса *
            <input type="text" id="courseTitle" name="courseTitle" value="${course.title}" required>
          </label>
          <label for="courseDescription">
            Описание
            <textarea id="courseDescription" name="courseDescription" rows="3">${course.description || ''}</textarea>
          </label>
          <label>
            <input type="checkbox" id="courseLock" name="courseLock" role="switch" ${course.lockUntilPassed ? 'checked' : ''}>
            Блокировать следующий урок до прохождения предыдущего
          </label>
          <footer class="form-footer">
              <button type="submit">Сохранить</button>
              <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">Отмена</a>
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

      const updatedCourse = {
        ...course,
        title,
        description,
        lockUntilPassed
      };

      Storage.saveCourse(updatedCourse);
      Admin.setTab('courses');
    });
  },

  // Удаление курса
  deleteCourse(courseId) {
    if (confirm('Вы уверены, что хотите удалить курс и все его уроки?')) {
      Storage.deleteCourse(courseId);
      Admin.render();
    }
  },

  // Переключение блокировки курса
  toggleLock(courseId) {
    const course = Storage.getCourses().find(c => c.id === courseId);
    if (course) {
      course.lockUntilPassed = !course.lockUntilPassed;
      Storage.saveCourse(course);
      // No need to re-render, the switch is now stateful
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
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="page-header">
          <hgroup>
              <h2>${lessonId === this.state.editingLesson?.id ? 'Создание урока' : 'Редактирование урока'}</h2>
              <p>Наполните урок контентом и тестами.</p>
          </hgroup>
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">← Назад</a>
      </header>
      <article>
          <form id="lessonForm">
            <label for="lessonTitle">
              Название урока *
              <input type="text" id="lessonTitle" value="${lesson.title}" required>
            </label>
            <label for="lessonContent">
              Контент урока (Markdown + шорткоды)
              <textarea id="lessonContent" name="lessonContent" rows="10" class="monospace-font">${lesson.content || ''}</textarea>
              <small>
                <strong>Шорткоды:</strong>
                <code>[img:...]</code>, <code>[file:...]</code>, <code>[video:...]</code>, <code>[quiz:...]</code>
              </small>
            </label>

            <a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); AdminQuizzes.insertQuiz('${courseId}')">+ Вставить тест</a>
            
            <footer class="form-footer">
              <button type="submit">Сохранить</button>
              <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Admin.render()">Отмена</a>
            </footer>
          </form>
      </article>
    `;

    document.getElementById('lessonForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('lessonTitle').value.trim();
      const content = document.getElementById('lessonContent').value;

      if (!title) return;

      const updatedLesson = {
        ...lesson,
        title,
        content
      };

      const courses = Storage.getCourses();
      const courseIndex = courses.findIndex(c => c.id === courseId);
      if (courseIndex >= 0) {
        const lessonIndex = courses[courseIndex].lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex >= 0) {
          courses[courseIndex].lessons[lessonIndex] = updatedLesson;
        } else {
          courses[courseIndex].lessons.push(updatedLesson);
        }
        Storage.saveCourses();
      }

      Admin.setTab('courses');
    });
  },

  // Удаление урока
  deleteLesson(courseId, lessonId) {
    if (confirm('Вы уверены, что хотите удалить урок?')) {
      const courses = Storage.getCourses();
      const courseIndex = courses.findIndex(c => c.id === courseId);
      if (courseIndex >= 0) {
        courses[courseIndex].lessons = courses[courseIndex].lessons.filter(l => l.id !== lessonId);
        Storage.saveCourses();
        Admin.render();
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
          Storage.importCourses(event.target.result);
          Admin.render();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
};
