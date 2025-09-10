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
    app.className = '';

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
      <div class="card fade-in" style="max-width: 500px; margin: 50px auto; padding: 30px; text-align: center;">
        <h2>Добро пожаловать</h2>
        <p style="margin-bottom: 25px;">Выберите вашу роль для входа в систему.</p>
        <button onclick="Core.setView('register')" class="btn btn-primary" style="margin-bottom: 15px;">Я — обучаемый</button>
        <button onclick="Core.renderAdminLogin()" class="btn btn-secondary">Я — администратор</button>
      </div>
    `;
  },

  // Экран входа для администратора
  renderAdminLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="card fade-in" style="max-width: 500px; margin: 50px auto; padding: 30px;">
        <button onclick="Core.setView('login')" class="btn btn-secondary" style="margin-bottom: 20px;">← Назад</button>
        <h2>Вход для администратора</h2>
        <form id="adminLoginForm">
          <div class="form-group">
            <label for="adminLogin">Логин</label>
            <input type="text" id="adminLogin" required>
          </div>
          <div class="form-group">
            <label for="adminPassword">Пароль</label>
            <input type="password" id="adminPassword" required>
          </div>
          <button type="submit" class="btn btn-primary">Войти</button>
        </form>
      </div>
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
      <div class="card fade-in" style="max-width: 500px; margin: 50px auto; padding: 30px;">
        <button onclick="Core.setView('login')" class="btn btn-secondary" style="margin-bottom: 20px;">← Назад</button>
        <h2>Регистрация</h2>
        <p>Пожалуйста, введите ваши данные для начала обучения.</p>
        <form id="userForm">
          <div class="form-group">
            <label for="userName">ФИО *</label>
            <input type="text" id="userName" required placeholder="Иванов Иван Иванович">
          </div>
          <div class="form-group">
            <label for="userDepartment">Отдел / Роль</label>
            <input type="text" id="userDepartment" placeholder="Отдел безопасности">
          </div>
          <button type="submit" class="btn btn-primary">Начать обучение</button>
        </form>
      </div>
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
      <div class="page-header">
        <h1>Платформа обучения</h1>
      </div>
    `;
  
    const courses = Storage.getCourses();
    html += `<div class="content-section"><h2>Доступные курсы</h2>`;
  
    if (courses.length === 0) {
      html += `<p>Нет доступных курсов. Перейдите в админку для создания.</p>`;
    } else {
      html += `<div class="course-list-grid">`;
      courses.forEach(course => {
        const progress = Users.getUserProgress(this.state.currentUser.id);
        const courseProgress = progress[course.id] || {};
        const completedLessons = Object.values(courseProgress).filter(l => l.completed).length;
        const totalLessons = course.lessons.length;
        const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
        html += `
          <div class="card fade-in course-card">
            <h3 class="course-title">${course.title}</h3>
            <p class="course-description">${course.description || ''}</p>
            <div class="course-progress-container mt-15">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
              </div>
              <small class="course-progress-text">${completedLessons} из ${totalLessons} уроков</small>
            </div>
            <button onclick="Core.setView('course', { currentCourseId: '${course.id}' })" class="btn btn-primary mt-10">
              ${percent === 100 ? 'Повторить' : 'Начать'}
            </button>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
  
    app.innerHTML = html;
  },
  
  // Обновление кнопок в основном navbar
  updateMainNavbar() {
    const mainNavButtons = document.getElementById('main-nav-buttons');
    if (mainNavButtons) {
      mainNavButtons.innerHTML = `
        <span>Привет, ${this.state.currentUser.name}</span>
        <button onclick="Core.switchUser()" class="btn btn-secondary ml-10">Сменить</button>
        ${this.state.isAdmin ? `
        <button onclick="Core.toggleAdminMode()" class="btn btn-secondary ml-10">
          ${this.state.isAdminMode ? 'Обучение' : 'Админка'}
        </button>
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
      <div class="page-header">
        <button onclick="Core.setView('home')" class="btn btn-secondary">← Назад</button>
        <h2>${course.title}</h2>
        <div></div>
      </div>
      <div class="content-section">
        <h3>Уроки</h3>
    `;
  
    course.lessons.forEach((lesson, index) => {
      const progress = Users.getUserProgress(this.state.currentUser.id);
      const lessonProgress = progress[course.id]?.[lesson.id] || {};
      const isCompleted = lessonProgress.completed || false;
      const isLocked = this.isLessonLocked(course, index, progress);
  
      html += `
        <div class="card lesson-card" style="opacity: ${isLocked ? '0.6' : '1'};">
          <div class="lesson-card-content">
            <div>
              <h4 class="lesson-title">${index + 1}. ${lesson.title}</h4>
              ${isCompleted ? '<span class="lesson-status success-text">✅ Пройдено</span>' : ''}
            </div>
            <button 
              onclick="Core.setView('lesson', { currentCourseId: '${course.id}', currentLessonId: '${lesson.id}' })" 
              class="btn btn-primary"
              ${isLocked ? 'disabled title="Сначала пройдите предыдущий урок"' : ''}
            >
              ${isCompleted ? 'Повторить' : 'Начать'}
            </button>
          </div>
        </div>
      `;
    });
  
    html += `</div>`;
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
      <div class="page-header">
        <button onclick="Core.setView('course', { currentCourseId: '${courseId}' })" class="btn btn-secondary">← Назад</button>
        <h2>${lesson.title}</h2>
        <div></div>
      </div>
      <div class="content-section" id="lessonContent">
        <div class="loading-text">Загрузка контента...</div>
      </div>
    `;
  
    app.innerHTML = html;
  
    setTimeout(() => {
      const contentDiv = document.getElementById('lessonContent');
      let processedContent = Shortcodes.parse(lesson.content || '');
      contentDiv.innerHTML = processedContent;
  
      const completeBtn = document.createElement('div');
      completeBtn.innerHTML = `
        <button onclick="Core.completeLesson('${courseId}', '${lessonId}')" class="btn btn-primary mt-20">
          Завершить урок
        </button>
      `;
      contentDiv.appendChild(completeBtn);
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
        <div class="card info-card fade-in">
          <h2>Тест недоступен</h2>
          <p>Вы исчерпали все ${quiz.maxAttempts} попыток.</p>
          <p>Обратитесь к администратору для сброса.</p>
          <button onclick="history.back()" class="btn btn-secondary mt-20">Назад</button>
        </div>
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
      <div class="card result-card fade-in">
        <h2>Результат теста</h2>
        <div class="quiz-score ${isPassed ? 'text-success' : 'text-danger'}">
          ${result.score}%
        </div>
        <p>Вы ${isPassed ? 'прошли' : 'не прошли'} тест.</p>
        <p>Проходной балл: ${quiz.passingScore}%</p>
    `;
  
    const attempts = Storage.getQuizAttempts(this.state.currentUser.id, quiz.id);
    if (!isPassed && (quiz.maxAttempts === 0 || attempts < quiz.maxAttempts)) {
      html += `
        <button onclick="Core.navigateAfterQuiz('quiz', null, null, '${quiz.id}')" class="btn btn-primary mt-20">
          Пройти повторно
        </button>
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
            <button onclick="Core.navigateAfterQuiz('lesson', '${courseId}', '${nextLesson.id}')" class="btn btn-primary mt-20">
              Перейти к следующему уроку: ${nextLesson.title}
            </button>
          `;
        } else {
          // Уроков в текущем курсе больше нет, ищем следующий курс
          const allCourses = Storage.getCourses();
          const currentCourseIndex = allCourses.findIndex(c => c.id === courseId);
          const nextCourse = allCourses[currentCourseIndex + 1];
  
          if (nextCourse) {
            // Есть следующий курс
            html += `
              <button onclick="Core.navigateAfterQuiz('course', '${nextCourse.id}')" class="btn btn-primary mt-20">
                Перейти к следующему курсу: ${nextCourse.title}
              </button>
            `;
          }
        }
      }
    }
  
    html += `
        <div class="button-group mt-20 justify-center">
          <button onclick="Core.navigateAfterQuiz('course', '${courseId}')" class="btn btn-secondary">Вернуться к урокам</button>
          <button onclick="Core.navigateAfterQuiz('home')" class="btn btn-secondary">Вернуться к курсам</button>
        </div>
      </div>
    `;
  
    console.log('Generated HTML for quiz result:', html); // Добавляем лог
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