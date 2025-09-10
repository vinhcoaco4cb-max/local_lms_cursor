/**
 * ADMIN/DASHBOARD.JS — Модуль главного дашборда админки
 * Отображает общую статистику по платформе
 */
const AdminDashboard = {
    renderTab() {
      const users = Users.getAllUsers();
      const courses = Storage.getCourses();
      const lessons = courses.flatMap(c => c.lessons);
      const completedLessons = users.reduce((total, user) => {
        const progress = Users.getUserProgress(user.id);
        return total + Object.values(progress).flatMap(p => Object.values(p)).filter(l => l.completed).length;
      }, 0);
      const totalLessons = lessons.length * users.length;
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
      let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
          <div class="card" style="text-align: center;">
            <h3>Пользователи</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">${users.length}</div>
          </div>
          <div class="card" style="text-align: center;">
            <h3>Курсы</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">${courses.length}</div>
          </div>
          <div class="card" style="text-align: center;">
            <h3>Уроки</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">${lessons.length}</div>
          </div>
          <div class="card" style="text-align: center;">
            <h3>Общий прогресс</h3>
            <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">${overallProgress}%</div>
          </div>
        </div>
        <div>
          <h3>Последние действия</h3>
          <div class="card" id="latestActivity">
            <p>Пока нет данных.</p>
          </div>
        </div>
      `;
  
      return html;
    },
  };