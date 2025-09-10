/**
 * SHORTCODES.JS — Парсер шорткодов
 * Поддерживает: [img:], [file:], [video:], [quiz:], [dragdrop:]
 * Интегрируется с Modals.js и Quizzes.js
 */

const Shortcodes = {
    // Основная функция парсинга
    parse(content) {
      if (!content) return '';
  
      let processed = content;
  
      // Парсим Markdown (если нужно — можно подключить marked.js, но пока — базовый парсинг)
      processed = this.parseMarkdown(processed);
  
      // Парсим шорткоды — в порядке от сложных к простым (чтобы не пересекались)
      processed = this.parseDragDrop(processed);
      processed = this.parseQuiz(processed);
      processed = this.parseVideo(processed);
      processed = this.parseFile(processed);
      processed = this.parseImage(processed);
  
      return processed;
    },
  
    // Базовый парсер Markdown (можно заменить на marked.js позже)
    parseMarkdown(text) {
      // Заголовки
      text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
      text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
      text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
      // Жирный и курсив
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
      // Списки
      text = text.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
      text = text.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>'); // Упрощённо — можно улучшить
  
      text = text.replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>');
      text = text.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>'); // Упрощённо
  
      // Абзацы
      text = text.replace(/\n\n/g, '</p><p>');
      text = text.replace(/^([^\n<].*)$/gm, '<p>$1</p>');
  
      return text;
    },
  
    // Парсинг [img:path/to/image.jpg]
    parseImage(text) {
      return text.replace(/\[img:([^\]]+)\]/g, (match, path) => {
        return `<img src="${path}" alt="Изображение" style="max-width: 100%; border-radius: var(--border-radius); margin: var(--spacing-md) 0; cursor: pointer;" onclick="Modals.openImage('${path}')">`;
      });
    },
  
    // Парсинг [file:path/to/document.pdf]
    parseFile(text) {
      return text.replace(/\[file:([^\]]+)\]/g, (match, path) => {
        const fileName = path.split('/').pop();
        return `<button onclick="Modals.openFile('${path}')" class="btn btn-secondary" style="margin: var(--spacing-sm) 0;">
          📄 Открыть файл: ${fileName}
        </button>`;
      });
    },
  
    // Парсинг [video:path/to/video.mp4]
    parseVideo(text) {
      return text.replace(/\[video:([^\]]+)\]/g, (match, path) => {
        const fileName = path.split('/').pop();
        return `<button onclick="Modals.openVideo('${path}')" class="btn btn-secondary" style="margin: var(--spacing-sm) 0;">
          🎬 Воспроизвести видео: ${fileName}
        </button>`;
      });
    },
  
    // Парсинг [quiz:quiz-id]
    parseQuiz(text) {
      return text.replace(/\[quiz:([^\]]+)\]/g, (match, quizId) => {
        return `<div class="card" style="margin: var(--spacing-lg) 0;" data-quiz-id="${quizId}">
          <div style="text-align: center; padding: 20px;">
            <button onclick="Core.setView('quiz', { currentQuizId: '${quizId}', currentCourseId: Core.state.currentCourseId, currentLessonId: Core.state.currentLessonId })" class="btn btn-primary">
              Начать тест
            </button>
          </div>
        </div>`;
      });
    },
  
    // Парсинг [dragdrop:dragdrop-id] — пока заглушка, будет реализовано в quizzes.js
    parseDragDrop(text) {
      return text.replace(/\[dragdrop:([^\]]+)\]/g, (match, id) => {
        return `<div class="card" style="margin: var(--spacing-lg) 0;" data-dragdrop-id="${id}">
          <div style="text-align: center; padding: 20px;">
            <button onclick="alert('Drag & Drop тест будет реализован в quizzes.js')" class="btn btn-primary">
              Начать Drag & Drop тест
            </button>
          </div>
        </div>`;
      });
    }
  };