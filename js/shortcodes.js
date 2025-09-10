/**
 * SHORTCODES.JS — Парсер шорткодов
 * Поддерживает: [img:], [file:], [video:], [quiz:]
 * Интегрируется с Modals.js и Quizzes.js
 */

const Shortcodes = {
  // Основная функция парсинга
  parse(content) {
    if (!content) return '';

    let processed = content;

    // Парсим Markdown
    processed = this.parseMarkdown(processed);

    // Парсим шорткоды
    processed = this.parseQuiz(processed);
    processed = this.parseVideo(processed);
    processed = this.parseFile(processed);
    processed = this.parseImage(processed);

    return processed;
  },

  // Базовый парсер Markdown
  parseMarkdown(text) {
      // Заголовки
      text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
      text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
      text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
      // Жирный и курсив
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Списки (упрощенная реализация)
      text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
      text = text.replace(/(\n<li>.*<\/li>)+/g, (match) => `<ul>${match.replace(/\n/g, '')}</ul>`);
      // Абзацы
      text = text.replace(/^\s*([^\n<#*].*)/gm, '<p>$1</p>');
      return text;
  },

  // Парсинг [img:path/to/image.jpg]
  parseImage(text) {
    return text.replace(/\[img:([^\]]+)\]/g, (match, path) => {
      return `<figure>
                <img src="${path}" alt="Изображение" style="cursor: pointer;" onclick="Modals.openImage('${path}')">
                <figcaption><small>Нажмите на изображение для увеличения</small></figcaption>
              </figure>`;
    });
  },

  // Парсинг [file:path/to/document.pdf]
  parseFile(text) {
    return text.replace(/\[file:([^\]]+)\]/g, (match, path) => {
      const fileName = path.split('/').pop();
      return `<a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); Modals.openFile('${path}')">
        📄 Открыть файл: ${fileName}
      </a>`;
    });
  },

  // Парсинг [video:path/to/video.mp4]
  parseVideo(text) {
    return text.replace(/\[video:([^\]]+)\]/g, (match, path) => {
      const fileName = path.split('/').pop();
      return `<a href="#" role="button" class="secondary outline" onclick="event.preventDefault(); Modals.openVideo('${path}')">
        🎬 Воспроизвести видео: ${fileName}
      </a>`;
    });
  },

  // Парсинг [quiz:quiz-id]
  parseQuiz(text) {
    return text.replace(/\[quiz:([^\]]+)\]/g, (match, quizId) => {
      const quiz = Storage.getQuiz(quizId);
      return `<article class="quiz-embed">
        <hgroup>
          <h4>Тест: ${quiz ? quiz.title : 'Не найден'}</h4>
          <p>Пройдите тест для закрепления материала.</p>
        </hgroup>
        <footer>
          <a href="#" role="button" onclick="event.preventDefault(); Core.setView('quiz', { currentQuizId: '${quizId}', currentCourseId: Core.state.currentCourseId, currentLessonId: Core.state.currentLessonId })">
            Начать тест
          </a>
        </footer>
      </article>`;
    });
  }
};
