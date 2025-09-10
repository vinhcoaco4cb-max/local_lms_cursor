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
        <div class="header-actions">
          <h3>Управление курсами</h3>
          <button onclick="AdminCourses.createCourse()" class="btn btn-primary">+ Создать курс</button>
        </div>
      `;
  
      if (courses.length === 0) {
        html += `<p>Нет курсов. Создайте первый курс.</p>`;
      } else {
        html += `<div class="grid-gap-20">`;
        courses.forEach(course => {
          html += `
            <div class="card">
              <div class="card-header-actions">
                <div>
                  <h4>${course.title}</h4>
                  <p>${course.description || ''}</p>
                  <small>Уроков: ${course.lessons.length}</small>
                  <div class="mt-15">
                    <label class="flex-align-center-gap-10">
                      <input type="checkbox" ${course.lockUntilPassed ? 'checked' : ''} onchange="AdminCourses.toggleLock('${course.id}')">
                      Блокировать следующий урок до прохождения
                    </label>
                  </div>
                </div>
                <div class="button-group">
                  <button onclick="AdminCourses.editCourse('${course.id}')" class="btn btn-secondary">Редактировать</button>
                  <button onclick="AdminCourses.deleteCourse('${course.id}')" class="btn btn-danger">Удалить</button>
                </div>
              </div>
              <div class="card-footer-section">
                <div class="header-actions-mb-15">
                  <h5>Уроки</h5>
                  <button onclick="AdminCourses.createLesson('${course.id}')" class="btn btn-secondary">+ Добавить урок</button>
                </div>
          `;
  
          if (course.lessons.length === 0) {
            html += `<p>Нет уроков. Добавьте первый урок.</p>`;
          } else {
            course.lessons.forEach(lesson => {
              html += `
                <div class="card card-lesson-item">
                  <div class="card-header-actions-start">
                    <div>
                      <strong>${lesson.title}</strong>
                      <div class="lesson-content-preview">
                        ${lesson.content ? lesson.content.substring(0, 100) + '...' : ''}
                      </div>
                    </div>
                    <div class="button-group compact">
                      <button onclick="AdminCourses.editLesson('${course.id}', '${lesson.id}')" class="btn btn-secondary remove-button-compact">Редактировать</button>
                      <button onclick="AdminCourses.deleteLesson('${course.id}', '${lesson.id}')" class="btn btn-danger remove-button-compact">×</button>
                    </div>
                  </div>
                </div>
              `;
            });
          }
  
          html += `
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
            <button onclick="Storage.exportCourses()" class="btn btn-primary">Экспорт курсов (JSON)</button>
            <button onclick="AdminCourses.importCourses()" class="btn btn-secondary">Импорт курсов (JSON)</button>
          </div>
        </div>
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
        <header class="admin-header">
          <button onclick="Admin.render()" class="btn btn-secondary">← Назад</button>
          <h2>${courseId === this.state.editingCourse?.id ? 'Создание курса' : 'Редактирование курса'}</h2>
          <div></div>
        </header>
        <div class="container-narrow">
          <div class="card">
            <form id="courseForm">
              <div class="form-group">
                <label for="courseTitle">Название курса *</label>
                <input type="text" id="courseTitle" value="${course.title}" required>
              </div>
              <div class="form-group">
                <label for="courseDescription">Описание</label>
                <textarea id="courseDescription" rows="3">${course.description || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="flex-align-center-gap-10">
                  <input type="checkbox" id="courseLock" ${course.lockUntilPassed ? 'checked' : ''}>
                  Блокировать следующий урок до прохождения предыдущего
                </label>
              </div>
              <div class="button-group mt-30">
                <button type="submit" class="btn btn-primary">Сохранить</button>
                <button type="button" onclick="Admin.render()" class="btn btn-secondary">Отмена</button>
              </div>
            </form>
          </div>
        </div>
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
        Admin.render();
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
        Admin.render(); // Обновляем страницу для показа состояния
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
        <header class="admin-header">
          <button onclick="Admin.render()" class="btn btn-secondary">← Назад</button>
          <h2>${lessonId === this.state.editingLesson?.id ? 'Создание урока' : 'Редактирование урока'}</h2>
          <div></div>
        </header>
        <div class="container-narrow-large">
          <div class="card">
            <form id="lessonForm">
              <div class="form-group">
                <label for="lessonTitle">Название урока *</label>
                <input type="text" id="lessonTitle" value="${lesson.title}" required>
              </div>
              <div class="form-group">
                <label for="lessonContent">Контент урока (Markdown + шорткоды)</label>
                <textarea id="lessonContent" rows="10" class="monospace-font">${lesson.content || ''}</textarea>
                <div class="shortcode-info">
                  <p><strong>Шорткоды:</strong></p>
                  <p><code>[img:files/path/to/image.jpg]</code> - изображение</p>
                  <p><code>[file:files/path/to/document.pdf]</code> - файл</p>
                  <p><code>[video:files/path/to/video.mp4]</code> - видео</p>
                  <p><code>[quiz:quiz-id]</code> - тест (добавьте через кнопку ниже)</p>
                </div>
              </div>
              <div class="form-group">
                <button type="button" onclick="AdminQuizzes.insertQuiz('${courseId}')" class="btn btn-secondary">+ Вставить тест</button>
              </div>
              <div class="button-group mt-30">
                <button type="submit" class="btn btn-primary">Сохранить</button>
                <button type="button" onclick="Admin.render()" class="btn btn-secondary">Отмена</button>
              </div>
            </form>
          </div>
        </div>
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
  
        Admin.render();
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