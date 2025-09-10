/**
 * USERS.JS — Управление пользователями и отчётами
 * Отвечает за: регистрацию, смену пользователя, генерацию и экспорт отчётов
 */
const Users = {
  // Показать экран регистрации
  showRegistration() {
    Core.setView('register');
  },

  // Смена пользователя
  switchUser() {
    localStorage.removeItem('currentUser');
    Core.state.currentUser = null;
    this.showRegistration();
  },

  // Получение всех пользователей (кто когда-либо запускал платформу на этом устройстве)
  getAllUsers() {
    const users = [];
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('progress_'));
    
    userKeys.forEach(key => {
      const userId = key.replace('progress_', '');
      let user = JSON.parse(localStorage.getItem(`user_${userId}`)) || {
        id: userId,
        name: `Пользователь ${userId}`,
        department: 'Неизвестно',
        registeredAt: 0
      };
      
      users.push(user);
    });
    
    if (Core.state.currentUser && !users.find(u => u.id === Core.state.currentUser.id)) {
        users.push(Core.state.currentUser);
    }
    
    return users;
  },

  // Получение прогресса пользователя по всем курсам
  getUserProgress(userId) {
    const key = `progress_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  },

  // Форматирование даты
  formatDate(timestamp) {
    if (!timestamp) return 'Неизвестно';
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Подсчёт общего прогресса пользователя
  calculateUserStats(userId) {
    const progress = this.getUserProgress(userId);
    let totalLessons = 0;
    let completedLessons = 0;
    let totalScore = 0;
    let coursesCompleted = 0;

    const courses = Storage.getCourses();
    courses.forEach(course => {
      const courseProgress = progress[course.id] || {};
      const lessons = course.lessons || [];
      totalLessons += lessons.length;

      let courseCompleted = true;
      lessons.forEach(lesson => {
        const lessonProgress = courseProgress[lesson.id] || {};
        if (lessonProgress.completed) {
          completedLessons++;
          totalScore += lessonProgress.score || 0;
        } else {
          courseCompleted = false;
        }
      });

      if (courseCompleted && lessons.length > 0) {
        coursesCompleted++;
      }
    });

    const avgScore = totalLessons > 0 ? Math.round(totalScore / completedLessons) : 0;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      coursesCompleted,
      avgScore,
      completionRate
    };
  }
};

// Отдельный объект для отчётов (Reports)
const Reports = {
  // Рендеринг страницы отчётов
  render() {
    const app = document.getElementById('app');
    const users = Users.getAllUsers();

    let html = `
      <header style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border);">
        <button onclick="Core.setView('admin')" class="btn btn-secondary">← Назад</button>
        <h2>Отчёты по пользователям</h2>
        <div>
          <button onclick="Reports.exportJSON()" class="btn btn-primary">Экспорт JSON</button>
          <button onclick="Reports.exportCSV()" class="btn btn-primary" style="margin-left: 10px;">Экспорт CSV</button>
        </div>
      </header>
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <input type="text" id="reportSearch" placeholder="Поиск по ФИО или отделу..." style="width: 300px; padding: 10px; border-radius: var(--border-radius); border: 1px solid var(--border);">
        </div>
        <div class="card">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--background-alt); text-align: left;">
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">ФИО</th>
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">Отдел</th>
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">Пройдено уроков</th>
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">Средний балл</th>
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">Курсов завершено</th>
                <th style="padding: 12px; border-bottom: 2px solid var(--border);">Последняя активность</th>
              </tr>
            </thead>
            <tbody id="reportsTableBody">
    `;

    if (users.length === 0) {
      html += `<tr><td colspan="6" style="padding: 20px; text-align: center;">Нет данных</td></tr>`;
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
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px;">${user.name}</td>
            <td style="padding: 12px;">${user.department || 'Не указан'}</td>
            <td style="padding: 12px;">${stats.completedLessons} из ${stats.totalLessons}</td>
            <td style="padding: 12px;">${stats.avgScore}%</td>
            <td style="padding: 12px;">${stats.coursesCompleted}</td>
            <td style="padding: 12px;">${lastDate}</td>
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

    app.innerHTML = html;

    // Добавляем поиск
    document.getElementById('reportSearch').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#reportsTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
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