/**
 * ADMIN/REPORTS.JS — Модуль отчётов
 * Отвечает за: рендеринг вкладки, просмотр статистики и экспорт отчётов
 */
const AdminReports = {
    // Рендеринг страницы отчётов
    renderTab() {
      const users = Users.getAllUsers();
  
      let html = `
        <header class="admin-header">
          <h2>Отчёты по пользователям</h2>
          <div class="button-group">
            <button onclick="AdminReports.exportJSON()" class="btn btn-primary">Экспорт JSON</button>
            <button onclick="AdminReports.exportCSV()" class="btn btn-primary">Экспорт CSV</button>
          </div>
        </header>
        <div class="container">
          <div class="mb-20">
            <input type="text" id="reportSearch" placeholder="Поиск по ФИО или отделу..." class="input-field search-field">
          </div>
          <div class="card">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="data-table-header">ФИО</th>
                  <th class="data-table-header">Отдел</th>
                  <th class="data-table-header">Пройдено уроков</th>
                  <th class="data-table-header">Средний балл</th>
                  <th class="data-table-header">Курсов завершено</th>
                  <th class="data-table-header">Последняя активность</th>
                </tr>
              </thead>
              <tbody id="reportsTableBody">
      `;
  
      if (users.length === 0) {
        html += `<tr><td colspan="6" class="data-table-cell text-center">Нет данных</td></tr>`;
      } else {
        users.forEach(user => {
          const stats = Users.calculateUserStats(user.id);
          const lastActivity = Users.getUserProgress(user.id);
          let lastDate = 'Никогда';
          for (const courseId in lastActivity) {
            for (const lessonId in lastActivity[courseId]) {
              const lesson = lastActivity[courseId][lessonId];
              if (lesson.updatedAt && (!lastDate || lesson.updatedAt > new Date(lastDate).getTime())) {
                lastDate = Users.formatDate(lesson.updatedAt);
              }
            }
          }
  
          html += `
            <tr class="data-table-row">
              <td class="data-table-cell">${user.name}</td>
              <td class="data-table-cell">${user.department || 'Не указан'}</td>
              <td class="data-table-cell">${stats.completedLessons} из ${stats.totalLessons}</td>
              <td class="data-table-cell">${stats.avgScore}%</td>
              <td class="data-table-cell">${stats.coursesCompleted}</td>
              <td class="data-table-cell">${lastDate}</td>
            </tr>
          `;
        });
      }
  
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
  
      return html;
    },
  
    // Экспорт отчётов в JSON
    exportJSON() {
      const users = Users.getAllUsers();
      const reports = {};
  
      users.forEach(user => {
        reports[user.id] = {
          name: user.name,
          department: user.department,
          registeredAt: Users.formatDate(user.registeredAt),
          stats: Users.calculateUserStats(user.id),
          progress: Users.getUserProgress(user.id)
        };
      });
  
      Storage.downloadFile(
        `reports_${new Date().toISOString().slice(0,10)}.json`,
        JSON.stringify(reports, null, 2),
        'application/json'
      );
    },
  
    // Экспорт отчётов в CSV
    exportCSV() {
      let csv = 'ID,ФИО,Отдел,Зарегистрирован,Пройдено уроков,Всего уроков,Средний балл,Курсов завершено,Последняя активность\n';
  
      const users = Users.getAllUsers();
      users.forEach(user => {
        const stats = Users.calculateUserStats(user.id);
        const lastActivity = Users.getUserProgress(user.id);
        let lastDate = 'Никогда';
        for (const courseId in lastActivity) {
          for (const lessonId in lastActivity[courseId]) {
            const lesson = lastActivity[courseId][lessonId];
            if (lesson.updatedAt && (!lastDate || lesson.updatedAt > new Date(lastDate).getTime())) {
              lastDate = Users.formatDate(lesson.updatedAt);
            }
          }
        }
  
        csv += `"${user.id}","${user.name}","${user.department || ''}","${Users.formatDate(user.registeredAt)}","${stats.completedLessons}","${stats.totalLessons}","${stats.avgScore}","${stats.coursesCompleted}","${lastDate}"\n`;
      });
  
      Storage.downloadFile(
        `reports_${new Date().toISOString().slice(0,10)}.csv`,
        csv,
        'text/csv'
      );
    }
  };