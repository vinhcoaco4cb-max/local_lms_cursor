/**
 * ADMIN.JS — Главный модуль админки
 * Служит точкой входа и перенаправляет запросы к подмодулям
 */
const Admin = {
  state: {
    currentTab: 'dashboard',
  },
  app: null,

  render() {
    if (!Core.state.isAdmin) {
      alert('Доступ запрещен.');
      Core.setView('home');
      return;
    }
    this.app = document.getElementById('app');
    const header = document.getElementById('main-header');
    
    // Рендерим шапку админки
    header.innerHTML = `
      <nav>
        <ul>
          <li><strong>Администрирование</strong></li>
        </ul>
        <ul class="admin-user-menu">
          <li><span>${Core.state.currentUser.name}</span></li>
          <li><a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); Core.switchUser()">Выйти</a></li>
        </ul>
      </nav>
    `;

    // Рендерим основную часть админки
    let html = `
      <nav class="secondary">
        <ul>
          <li><a href="#" role="tab" onclick="event.preventDefault(); Admin.setTab('dashboard')" ${this.state.currentTab === 'dashboard' ? 'aria-current="page"' : ''}>Дашборд</a></li>
          <li><a href="#" role="tab" onclick="event.preventDefault(); Admin.setTab('courses')" ${this.state.currentTab === 'courses' ? 'aria-current="page"' : ''}>Курсы</a></li>
          <li><a href="#" role="tab" onclick="event.preventDefault(); Admin.setTab('quizzes')" ${this.state.currentTab === 'quizzes' ? 'aria-current="page"' : ''}>Тесты</a></li>
          <li><a href="#" role="tab" onclick="event.preventDefault(); Admin.setTab('reports')" ${this.state.currentTab === 'reports' ? 'aria-current="page"' : ''}>Отчёты</a></li>
        </ul>
      </nav>
      <div id="admin-content">
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
        html += `<article>Выберите вкладку.</article>`;
    }

    html += `</div>`;
    this.app.innerHTML = html;

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

