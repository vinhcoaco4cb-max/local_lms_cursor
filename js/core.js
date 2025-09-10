/**
 * CORE.JS — Ядро платформы обучения
 * Отвечает за: инициализацию, роутинг, управление состоянием, переключение режимов
 */

const Core = {
  // Текущее состояние приложения
  state: {
    currentView: 'login',
    currentCourseId: null,
    currentLessonId: null,
    currentQuizId: null,
    isAdminMode: false,
    currentUser: null,
    isLoggedIn: false,
    isAdmin: false
  },

  // Константы для администратора
  ADMIN_CREDENTIALS: {
    login: 'admin',
    password: '123'
  },

  // Инициализация приложения
  init() {
    console.log('🚀 Платформа обучения — инициализация...');

    this.loadCurrentUser();
    Storage.loadCourses();
    Storage.loadQuizzes();

    // Первоначальная отрисовка на основе состояния
    this.render();
  },

  // Загрузка текущего пользователя из localStorage
  loadCurrentUser() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.state.currentUser = JSON.parse(saved);
      this.state.isLoggedIn = true;
      if (this.state.currentUser.id === 'admin') {
        this.state.isAdmin = true;
        this.state.isAdminMode = true; // Админ всегда начинает в режиме админки
      }
    } else {
        this.state.isLoggedIn = false;
    }
  },

  // Установка текущего представления
  setView(view, params = {}) {
    this.state.currentView = view;
    Object.assign(this.state, params);
    this.render();
  },

  // Основной рендеринг — переключает экраны
  render() {
    if (!this.state.isLoggedIn) {
      // Если пользователь не залогинен, показываем экран входа или регистрации
      if (this.state.currentView === 'register') {
        this.renderUserRegistration();
      } else {
        this.renderLoginScreen();
      }
      return;
    }
    
    if (this.state.isAdminMode) {
      this.renderAdminView();
    } else {
      this.renderStudentView();
    }
  },

  // Рендер для студента
  renderStudentView() {
    const header = document.getElementById('main-header');
    
    // Рендер шапки для студента
    header.innerHTML = `
      <nav>
        <ul>
          <li><strong>Платформа обучения</strong></li>
        </ul>
        <ul class="user-menu">
          ${this.state.currentUser ? `<li><span>${this.state.currentUser.name}</span></li>` : ''}
          ${this.state.isAdmin ? `<li><a href="#" role="button" class="contrast" onclick="event.preventDefault(); Core.toggleAdminMode()">В админку</a></li>` : ''}
          <li><a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); Core.switchUser()">Выйти</a></li>
        </ul>
      </nav>
    `;

    // Рендер контента для студента
    switch (this.state.currentView) {
      case 'home':
        this.renderHome();
        break;
      case 'course':
        this.renderCourse(this.state.currentCourseId);
        break;
      case 'lesson':
        this.renderLesson(this.state.currentCourseId, this.state.currentLessonId);
        break;
      case 'quiz':
        this.renderQuiz(this.state.currentQuizId);
        break;
      case 'register': // Добавляем обработку для нового представления 'register'
        this.renderUserRegistration();
        break;
      default:
        this.renderHome(); // По умолчанию показываем домашнюю страницу студента
    }
  },

  // Рендер для админа
  renderAdminView() {
      Admin.render();
  },

  toggleAdminMode() {
      this.state.isAdminMode = !this.state.isAdminMode;
      this.render();
  },
  
  // Экран выбора роли
  renderLoginScreen() {
    this.state.currentView = 'login'; // Устанавливаем текущий вид
    const app = document.getElementById('app');
    const header = document.getElementById('main-header');
    header.innerHTML = ''; // Очищаем шапку на экране входа

    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto; text-align: center;">
        <h2>Добро пожаловать</h2>
        <p style="margin-bottom: 25px;">Выберите вашу роль для входа в систему.</p>
        <footer>
          <div class="grid">
            <button onclick="Core.setView('register')">Я — обучаемый</button>
            <button onclick="Core.renderAdminLogin()" class="secondary">Я — администратор</button>
          </div>
        </footer>
      </article>
    `;
  },

  // Экран входа для администратора
  renderAdminLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto;">
        <a href="#" onclick="event.preventDefault(); Core.renderLoginScreen()" class="secondary" style="margin-bottom: 20px;">← Назад</a>
        <h2>Вход для администратора</h2>
        <form id="adminLoginForm">
          <label for="adminLogin">
            Логин
            <input type="text" id="adminLogin" name="adminLogin" required>
          </label>
          <label for="adminPassword">
            Пароль
            <input type="password" id="adminPassword" name="adminPassword" required>
          </label>
          <button type="submit">Войти</button>
        </form>
      </article>
    `;
    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const login = document.getElementById('adminLogin').value;
      const password = document.getElementById('adminPassword').value;
      if (login === this.ADMIN_CREDENTIALS.login && password === this.ADMIN_CREDENTIALS.password) {
        this.state.isAdmin = true;
        this.state.isLoggedIn = true;
        this.state.isAdminMode = true;
        this.state.currentUser = { id: 'admin', name: 'Администратор', department: 'Админка' };
        localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
        this.render();
      } else {
        alert('Неверный логин или пароль');
      }
    });
  },

  // Экран регистрации пользователя
  renderUserRegistration() {
    this.state.currentView = 'register';
    const app = document.getElementById('app');
    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto;">
        <a href="#" onclick="event.preventDefault(); Core.renderLoginScreen()" class="secondary" style="margin-bottom: 20px;">← Назад</a>
        <h2>Регистрация</h2>
        <p>Пожалуйста, введите ваши данные для начала обучения.</p>
        <form id="userForm">
          <label for="userName">
            ФИО *
            <input type="text" id="userName" name="userName" required placeholder="Иванов Иван Иванович">
          </label>
          <label for="userDepartment">
            Отдел / Роль
            <input type="text" id="userDepartment" name="userDepartment" placeholder="Отдел безопасности">
          </label>
          <button type="submit">Начать обучение</button>
        </form>
      </article>
    `;

    document.getElementById('userForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim();
      const department = document.getElementById('userDepartment').value.trim();

      if (!name) return;

      const user = {
        id: `user-${Date.now()}`,
        name,
        department,
        registeredAt: Date.now()
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
      
      this.state.currentUser = user;
      this.state.isLoggedIn = true;
      this.state.isAdmin = false;
      this.state.isAdminMode = false;
      this.setView('home');
    });
  },

  // Главная страница — список курсов
  renderHome() {
    const app = document.getElementById('app');
    let html = `
      <header>
        <h1 class="page-title">Доступные курсы</h1>
      </header>
    `;
  
    const courses = Storage.getCourses();
  
    if (courses.length === 0) {
      html += `<article><p>Нет доступных курсов. Обратитесь к администратору.</p></article>`;
    } else {
      html += `<div class="grid">`;
      courses.forEach(course => {
        const progress = Users.getUserProgress(this.state.currentUser.id);
        const courseProgress = progress[course.id] || {};
        const completedLessons = Object.values(courseProgress).filter(l => l.completed).length;
        const totalLessons = course.lessons.length;
        const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
        html += `
          <article class="fade-in">
            <hgroup>
              <h3>${course.title}</h3>
              <p>${course.description || ''}</p>
            </hgroup>
            <p>
              <progress value="${percent}" max="100"></progress>
              <small>${completedLessons} из ${totalLessons} уроков</small>
            </p>
            <footer>
              <a href="#" role="button" onclick="event.preventDefault(); Core.setView('course', { currentCourseId: '${course.id}' })">
                ${percent === 100 ? 'Повторить' : 'Продолжить'}
              </a>
            </footer>
          </article>
        `;
      });
      html += `</div>`;
    }
  
    app.innerHTML = html;
  },
  
  // Страница курса — список уроков
  renderCourse(courseId) {
    const app = document.getElementById('app');
    const course = Storage.getCourses().find(c => c.id === courseId);
    if (!course) {
      this.setView('home');
      return;
    }
  
    let html = `
      <header class="page-header">
        <hgroup>
          <h2>${course.title}</h2>
          <h3>Список уроков</h3>
        </hgroup>
        <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.setView('home')">← Назад к курсам</a>
      </header>
    `;
  
    course.lessons.forEach((lesson, index) => {
      const progress = Users.getUserProgress(this.state.currentUser.id);
      const lessonProgress = progress[course.id]?.[lesson.id] || {};
      const isCompleted = lessonProgress.completed || false;
      const isLocked = this.isLessonLocked(course, index, progress);
  
      html += `
        <article class="lesson-item" ${isLocked ? 'data-disabled' : ''}>
          <div class="lesson-item-content">
            <hgroup>
              <h4>${index + 1}. ${lesson.title}</h4>
              <p>${isCompleted ? '✅ Пройдено' : 'Не пройдено'}</p>
            </hgroup>
            <a 
              href="#"
              role="button"
              onclick="event.preventDefault(); if(!this.closest('article').hasAttribute('data-disabled')) Core.setView('lesson', { currentCourseId: '${course.id}', currentLessonId: '${lesson.id}' })" 
              ${isLocked ? 'aria-disabled="true" title="Сначала пройдите предыдущий урок"' : ''}
            >
              ${isCompleted ? 'Повторить' : 'Начать'}
            </a>
          </div>
        </article>
      `;
    });
  
    app.innerHTML = html;
  },
  
  // Проверка, заблокирован ли урок
  isLessonLocked(course, lessonIndex, progress) {
    if (lessonIndex === 0) return false;
    if (!course.lockUntilPassed) return false;
  
    const prevLesson = course.lessons[lessonIndex - 1];
    const prevProgress = progress[course.id]?.[prevLesson.id] || {};
    return !prevProgress.completed;
  },
  
  // Страница урока — контент + тесты
  renderLesson(courseId, lessonId) {
    const app = document.getElementById('app');
    const course = Storage.getCourse(courseId);
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      this.setView('course', { currentCourseId: courseId });
      return;
    }
  
    this.state.currentCourseId = courseId;
    this.state.currentLessonId = lessonId;
  
    let html = `
       <header class="page-header">
        <hgroup>
          <h2>${lesson.title}</h2>
          <p>Курс: ${course.title}</p>
        </hgroup>
        <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.setView('course', { currentCourseId: '${courseId}' })">← Назад к урокам</a>
      </header>
      <article id="lessonContent">
        <p aria-busy="true">Загрузка контента...</p>
      </article>
    `;
  
    app.innerHTML = html;
  
    setTimeout(() => {
      const contentDiv = document.getElementById('lessonContent');
      let processedContent = Shortcodes.parse(lesson.content || '');
      
      const article = document.createElement('article');
      article.innerHTML = processedContent;

      contentDiv.replaceWith(article);
    }, 100);
  },
  
  // Завершение урока
  completeLesson(courseId, lessonId) {
    Storage.saveUserProgress(this.state.currentUser.id, courseId, lessonId, {
      completed: true,
      score: 100,
      attempts: 1,
      passedAt: Date.now()
    });
    this.setView('course', { currentCourseId: courseId });
  },
  
  // Рендеринг теста
  renderQuiz(quizId) {
    const quiz = Storage.getQuiz(quizId);
    if (!quiz) {
      alert('Тест не найден');
      return;
    }
  
    const attempts = Storage.getQuizAttempts(this.state.currentUser.id, quizId);
    if (quiz.maxAttempts > 0 && attempts >= quiz.maxAttempts) {
      const app = document.getElementById('app');
      app.innerHTML = `
        <article class="fade-in" style="text-align:center;">
          <h2>Тест недоступен</h2>
          <p>Вы исчерпали все ${quiz.maxAttempts} попыток.</p>
          <footer>
            <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.renderLesson(Core.state.currentCourseId, Core.state.currentLessonId);">Вернуться к уроку</a>
          </footer>
        </article>
      `;
      return;
    }
  
    Quizzes.render(quiz, (result) => {
      Storage.saveQuizResult(this.state.currentUser.id, quizId, result);
      this.showQuizResult(quiz, result, this.state.currentCourseId, this.state.currentLessonId);
    });
  },

  // Сбросить попытки прохождения теста
  resetQuizAttempts(userId, quizId) {
    Storage.resetQuizAttempts(userId, quizId);
    this.renderQuiz(quizId);
  },

  // Показать результат теста
  showQuizResult(quiz, result, courseId, lessonId) {
    const app = document.getElementById('app');
    const isPassed = result.score >= quiz.passingScore;

    // Check if all quizzes in the lesson are passed
    if (isPassed) {
      const course = Storage.getCourse(courseId);
      const lesson = course.lessons.find(l => l.id === lessonId);

      if (lesson) {
        const quizIdsInLesson = [];
        const regex = /\[quiz:([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(lesson.content)) !== null) {
          quizIdsInLesson.push(match[1]);
        }

        const allQuizzesPassed = quizIdsInLesson.every(qId => {
          const q = Storage.getQuiz(qId);
          const lastResult = Storage.getLastQuizResult(this.state.currentUser.id, qId);
          return lastResult && lastResult.score >= q.passingScore;
        });

        if (allQuizzesPassed) {
          Core.completeLesson(courseId, lessonId);
          return; // Lesson is completed, no need to show quiz result screen
        }
      }
    }

    let html = `
      <article class="result-card fade-in" style="text-align:center;">
        <hgroup>
          <h2>Результат теста</h2>
          <h3 class="${isPassed ? '' : 'text-danger'}">
            Ваш результат: ${result.score}%
          </h3>
        </hgroup>
        <p>Вы ${isPassed ? '<strong>прошли</strong>' : '<strong>не прошли</strong>'} тест. Проходной балл: ${quiz.passingScore}%</p>
        
        <footer>
          <div class="grid">
    `;
  
    const attempts = Storage.getQuizAttempts(this.state.currentUser.id, quiz.id);
    if (!isPassed && (quiz.maxAttempts === 0 || attempts < quiz.maxAttempts)) {
      html += `
        <a href="#" role="button" onclick="event.preventDefault(); Core.setView('quiz', { currentQuizId: '${quiz.id}'})">
          Пройти повторно
        </a>
      `;
    }
    
    html += `
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.setView('course', { currentCourseId: '${courseId}'})">К урокам</a>
        </div>
      </footer>
    </article>
    `;
  
    app.innerHTML = html;
  },
  
  // Смена пользователя
  switchUser() {
    localStorage.removeItem('currentUser');
    this.state.currentUser = null;
    this.state.isLoggedIn = false;
    this.state.isAdmin = false;
    this.state.isAdminMode = false;
    
    const header = document.getElementById('main-header');
    header.innerHTML = ''; // Очищаем шапку

    // Прямой вызов для разрыва рекурсии
    this.renderLoginScreen();
  },
};

