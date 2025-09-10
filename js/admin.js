/**
 * ADMIN.JS — Главный модуль админки
 * Служит точкой входа и перенаправляет запросы к подмодулям
 */
const Admin = {
  // Текущее состояние
  state: {
    currentTab: 'dashboard', // Изменено на 'dashboard'
  },
  app: null, // Добавляем свойство app

  // Рендеринг админки
  render() {
    if (!Core.state.isAdmin) {
      alert('Доступ запрещен.');
      Core.setView('home');
      return;
    }
    this.app = document.getElementById('app'); // Инициализируем app здесь
    let html = `
      <nav class="navbar">
        <button onclick="Core.toggleAdminMode()" class="btn btn-secondary">← Назад</button>
        <a href="#" class="navbar-brand">Администрирование</a>
        <div class="navbar-nav">
          <button onclick="Admin.setTab('dashboard')" class="btn ${this.state.currentTab === 'dashboard' ? 'active' : ''}">Дашборд</button>
          <button onclick="Admin.setTab('courses')" class="btn ${this.state.currentTab === 'courses' ? 'active' : ''}">Курсы</button>
          <button onclick="Admin.setTab('quizzes')" class="btn ${this.state.currentTab === 'quizzes' ? 'active' : ''}">Тесты</button>
          <button onclick="Admin.setTab('reports')" class="btn ${this.state.currentTab === 'reports' ? 'active' : ''}">Отчёты</button>
        </div>
      </nav>
      <div class="container">
    `;

    switch (this.state.currentTab) {
      case 'dashboard':
        html += AdminDashboard.renderTab();
        break;
      case 'courses':
        html += AdminCourses.renderTab();
        break;
      case 'quizzes':
        html += AdminQuizzes.renderTab();
        break;
      case 'reports':
        html += AdminReports.renderTab();
        break;
      default:
        html += `<div>Выберите вкладку.</div>`;
    }

    html += `</div>`;
    this.app.innerHTML = html;

    // Call initEventListeners for specific tabs after rendering
    if (this.state.currentTab === 'quizzes') {
      AdminQuizzes.initEventListeners();
    }
  },

  setTab(tab) {
    if (!Core.state.isAdmin) return;
    this.state.currentTab = tab;
    this.render();
  },
};