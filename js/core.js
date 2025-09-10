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

    if (this.state.currentUser) {
      this.state.isLoggedIn = true;
      // Проверяем, является ли пользователь администратором
      if (this.state.isAdmin) {
        this.setView('admin'); // Если админ, переходим в админку
      } else {
        this.renderHome(); // Иначе на домашнюю страницу
      }
    } else {
      this.setView('login');
    }
  },

  // Загрузка текущего пользователя из localStorage
  loadCurrentUser() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.state.currentUser = JSON.parse(saved);
      if (this.state.currentUser.id === 'admin') {
        this.state.isAdmin = true; // Устанавливаем флаг администратора
      }
    }
  },

  // Переключение между режимами (обучение / админка)
  toggleAdminMode() {
    if (!this.state.isAdmin) return;

    this.state.isAdminMode = !this.state.isAdminMode;

    // После переключения режима, устанавливаем соответствующее представление
    if (this.state.isAdminMode) {
      this.setView('admin');
    } else {
      this.setView('home');
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
    const app = document.getElementById('app');

    switch (this.state.currentView) {
      case 'login':
        this.renderLoginScreen();
        break;
      case 'register':
        this.renderUserRegistration();
        break;
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
      case 'admin':
        Admin.render();
        break;
      case 'reports':
        Reports.render();
        break;
      default:
        app.innerHTML = '<h2>Страница не найдена</h2>';
    }
  },
  
  // Экран выбора роли
  renderLoginScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto; text-align: center;">
        <h2>Добро пожаловать</h2>
        <p style="margin-bottom: 25px;">Выберите вашу роль для входа в систему.</p>
        <footer>
          <button onclick="Core.setView('register')">Я — обучаемый</button>
          <button onclick="Core.renderAdminLogin()" class="secondary">Я — администратор</button>
        </footer>
      </article>
    `;
  },

  // Экран входа для администратора
  renderAdminLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto;">
        <a href="#" onclick="event.preventDefault(); Core.setView('login')" class="secondary" style="margin-bottom: 20px;">← Назад</a>
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
        this.state.currentUser = { id: 'admin', name: 'Администратор', department: 'Админка' };
        localStorage.setItem('currentUser', JSON.stringify(this.state.currentUser)); // Сохраняем admin пользователя в localStorage
        this.setView('admin'); // Перенаправляем в админку
      } else {
        alert('Неверный логин или пароль');
      }
    });
  },

  // Экран регистрации пользователя
  renderUserRegistration() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <article class="fade-in" style="max-width: 500px; margin: 50px auto;">
        <a href="#" onclick="event.preventDefault(); Core.setView('login')" class="secondary" style="margin-bottom: 20px;">← Назад</a>
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
      localStorage.setItem(`user_${user.id}`, JSON.stringify(user)); // Add this line
      this.state.currentUser = user;
      this.state.isLoggedIn = true;
      this.state.isAdmin = false;

      this.renderHome();
    });
  },

  // Главная страница — список курсов
  renderHome() {
    if (!this.state.isLoggedIn) {
      this.setView('login');
      return;
    }
  
    this.updateMainNavbar(); // Обновляем кнопки в главном navbar
  
    const app = document.getElementById('app');
    let html = `
      <header>
        <h1 class="page-title">Платформа обучения</h1>
      </header>
    `;
  
    const courses = Storage.getCourses();
    html += `<h2>Доступные курсы</h2>`;
  
    if (courses.length === 0) {
      html += `<article><p>Нет доступных курсов. Перейдите в админку для создания.</p></article>`;
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
                ${percent === 100 ? 'Повторить' : 'Начать'}
              </a>
            </footer>
          </article>
        `;
      });
      html += `</div>`;
    }
  
    app.innerHTML = html;
  },
  
  // Обновление кнопок в основном navbar
  updateMainNavbar() {
    const mainNavButtons = document.getElementById('main-nav-buttons');
    if (mainNavButtons) {
      mainNavButtons.innerHTML = `
        <li>${this.state.currentUser.name}</li>
        <li><a href="#" role="button" onclick="event.preventDefault(); Core.switchUser()" class="secondary outline">Сменить</a></li>
        ${this.state.isAdmin ? `
        <li>
          <a href="#" role="button" onclick="event.preventDefault(); Core.toggleAdminMode()" class="contrast">
            ${this.state.isAdminMode ? 'К обучению' : 'В админку'}
          </a>
        </li>
        ` : ''}
      `;
    }
  },
  
  // Страница курса — список уроков
  renderCourse(courseId) {
    if (!this.state.isLoggedIn) {
      this.setView('login');
      return;
    }
    const course = Storage.getCourses().find(c => c.id === courseId);
    if (!course) {
      this.setView('home');
      return;
    }
  
    this.updateMainNavbar(); // Обновляем кнопки в главном navbar
  
    const app = document.getElementById('app');
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
    if (!this.state.isLoggedIn) {
      this.setView('login');
      return;
    }
    const course = Storage.getCourse(courseId);
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      this.setView('course', { currentCourseId: courseId });
      return;
    }
  
    // Устанавливаем текущие курс и урок в состояние для глобального доступа
    this.state.currentCourseId = courseId;
    this.state.currentLessonId = lessonId;
  
    this.updateMainNavbar(); // Обновляем кнопки в главном navbar
  
    const app = document.getElementById('app');
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

      const completeBtnContainer = document.createElement('footer');
      completeBtnContainer.style.marginTop = '2rem';
      completeBtnContainer.innerHTML = `
        <button onclick="Core.completeLesson('${courseId}', '${lessonId}')">
          Завершить урок
        </button>
      `;
      article.appendChild(completeBtnContainer);
      contentDiv.replaceWith(article);
    }, 100);
  },
  
  // Завершение урока
  completeLesson(courseId, lessonId) {
    if (!this.state.isLoggedIn) return;
    
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
    if (!this.state.isLoggedIn) {
      this.setView('login');
      return;
    }
  
    const quiz = Storage.getQuiz(quizId);
    if (!quiz) {
      alert('Тест не найден');
      return;
    }
  
    this.updateMainNavbar(); // Обновляем кнопки в главном navbar
  
    const attempts = Storage.getQuizAttempts(this.state.currentUser.id, quizId);
    if (quiz.maxAttempts > 0 && attempts >= quiz.maxAttempts) {
      const app = document.getElementById('app');
      app.innerHTML = `
        <article class="fade-in" style="text-align:center;">
          <h2>Тест недоступен</h2>
          <p>Вы исчерпали все ${quiz.maxAttempts} попыток.</p>
          <p>Обратитесь к администратору для сброса.</p>
          <footer>
            <a href="#" role="button" class="secondary" onclick="event.preventDefault(); history.back()">Назад</a>
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
  
  // Показать результат теста
  showQuizResult(quiz, result, courseId, lessonId) {
    const app = document.getElementById('app');
    const isPassed = result.score >= quiz.passingScore;
  
    this.updateMainNavbar(); // Обновляем кнопки в главном navbar
  
    let html = `
      <article class="result-card fade-in" style="text-align:center;">
        <hgroup>
          <h2>Результат теста</h2>
          <h3 class="${isPassed ? 'text-success' : 'text-danger'}">
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
        <a href="#" role="button" onclick="event.preventDefault(); Core.navigateAfterQuiz('quiz', null, null, '${quiz.id}')">
          Пройти повторно
        </a>
      `;
    }
  
    // Логика для кнопок навигации
    if (isPassed) {
      const course = Storage.getCourse(courseId);
      if (course) {
        const currentLessonIndex = course.lessons.findIndex(l => l.id === lessonId);
        const nextLesson = course.lessons[currentLessonIndex + 1];
  
        if (nextLesson) {
          // Есть следующий урок в текущем курсе
          html += `
            <a href="#" role="button" onclick="event.preventDefault(); Core.navigateAfterQuiz('lesson', '${courseId}', '${nextLesson.id}')">
              Следующий урок
            </a>
          `;
        } else {
          // Уроков в текущем курсе больше нет, ищем следующий курс
          const allCourses = Storage.getCourses();
          const currentCourseIndex = allCourses.findIndex(c => c.id === courseId);
          const nextCourse = allCourses[currentCourseIndex + 1];
  
          if (nextCourse) {
            // Есть следующий курс
            html += `
              <a href="#" role="button" onclick="event.preventDefault(); Core.navigateAfterQuiz('course', '${nextCourse.id}')">
                Следующий курс
              </a>
            `;
          }
        }
      }
    }
  
    html += `
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.navigateAfterQuiz('course', '${courseId}')">К урокам</a>
          <a href="#" role="button" class="secondary" onclick="event.preventDefault(); Core.navigateAfterQuiz('home')">К курсам</a>
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
    this.renderLoginScreen();
    this.updateMainNavbar(); // Очищаем навигацию при смене пользователя
  },
  
  // Вспомогательная функция для навигации после теста
  navigateAfterQuiz(view, courseId = null, lessonId = null, quizId = null) {
    const params = {};
    if (courseId) params.currentCourseId = courseId;
    if (lessonId) params.currentLessonId = lessonId;
    if (quizId) params.currentQuizId = quizId;
    this.setView(view, params);
  }
};
