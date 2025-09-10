/**
 * MODALS.JS — Модальные окна для файлов, изображений, видео
 * Открывает контент из папки files/ в модальных окнах
 */

const Modals = {
    // Открыть изображение
    openImage(src) {
      this.showModal(`
        <img src="${src}" alt="Изображение" style="max-width: 100%; max-height: 80vh; display: block; margin: 0 auto;">
      `);
    },
  
    // Открыть файл (PDF, DOCX, PPTX и т.д.)
    openFile(src) {
      const ext = src.split('.').pop().toLowerCase();
      let content = '';
  
      if (ext === 'pdf') {
        // PDF — пытаемся открыть во встроенном просмотрщике
        content = `
          <iframe src="${src}" style="width: 100%; height: 80vh; border: none;" frameborder="0"></iframe>
        `;
      } else if (['docx', 'doc', 'pptx', 'ppt', 'odt', 'xls', 'xlsx'].includes(ext)) {
        // Документы — предлагаем скачать + пробуем открыть в iframe (если браузер поддерживает)
        content = `
          <div style="text-align: center; padding: 20px;">
            <p>Для просмотра этого документа может потребоваться соответствующая программа.</p>
            <iframe src="${src}" style="width: 100%; height: 60vh; border: 1px solid var(--border); margin: 20px 0;" frameborder="0"></iframe>
            <a href="${src}" download class="btn btn-primary" style="margin-top: 20px;">Скачать файл</a>
          </div>
        `;
      } else {
        // Любые другие файлы — просто скачивание
        content = `
          <div style="text-align: center; padding: 40px;">
            <p>Файл готов к скачиванию.</p>
            <a href="${src}" download class="btn btn-primary" style="margin-top: 20px;">Скачать</a>
          </div>
        `;
      }
  
      this.showModal(content);
    },
  
    // Открыть видео
    openVideo(src) {
      this.showModal(`
        <video controls style="max-width: 100%; max-height: 80vh; display: block; margin: 0 auto;">
          <source src="${src}" type="video/mp4">
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      `);
    },
  
    // Показать модальное окно с произвольным контентом
    showModal(content) {
      // Создаём оверлей, если его ещё нет
      if (!document.getElementById('modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
          <div class="modal">
            <button class="modal-close">&times;</button>
            <div id="modal-content"></div>
          </div>
        `;
        document.body.appendChild(overlay);
  
        // Закрытие по клику на оверлей
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.closeModal();
          }
        });
  
        // Закрытие по Esc
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeModal();
          }
        });
  
        // Закрытие по кнопке
        overlay.querySelector('.modal-close').addEventListener('click', () => {
          this.closeModal();
        });
      }
  
      // Устанавливаем контент
      document.getElementById('modal-content').innerHTML = content;
  
      // Показываем
      document.getElementById('modal-overlay').classList.add('active');
    },
  
    // Закрыть модальное окно
    closeModal() {
      const overlay = document.getElementById('modal-overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  };