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
    const totalLessonsToComplete = lessons.length * users.length;
    const overallProgress = totalLessonsToComplete > 0 ? Math.round((completedLessons / totalLessonsToComplete) * 100) : 0;

    let html = `
      <div class="grid">
        <article style="text-align: center;">
          <hgroup>
              <h3>Пользователи</h3>
              <p>Всего зарегистрировано</p>
          </hgroup>
          <div style="font-size: 3rem; font-weight: bold;">${users.length}</div>
        </article>
        <article style="text-align: center;">
          <hgroup>
              <h3>Курсы</h3>
              <p>Всего создано</p>
          </hgroup>
          <div style="font-size: 3rem; font-weight: bold;">${courses.length}</div>
        </article>
        <article style="text-align: center;">
          <hgroup>
              <h3>Уроки</h3>
              <p>Всего в системе</p>
          </hgroup>
          <div style="font-size: 3rem; font-weight: bold;">${lessons.length}</div>
        </article>
        <article style="text-align: center;">
          <hgroup>
              <h3>Общий прогресс</h3>
              <p>Процент прохождения</p>
          </hgroup>
          <div style="font-size: 3rem; font-weight: bold;">${overallProgress}%</div>
        </article>
      </div>
      <article>
          <hgroup>
              <h3>Последние действия</h3>
              <p>Информация о последних действиях пользователей будет добавлена в будущем.</p>
          </hgroup>
          <p aria-busy="true">Загрузка данных...</p>
      </article>
    `;

    return html;
  },
};
