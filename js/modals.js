/**
 * MODALS.JS — Модальные окна для файлов, изображений, видео
 * Открывает контент из папки files/ в модальных окнах
 */

const Modals = {
  // Открыть изображение
  openImage(src) {
    this.showModal(`
      <figure>
        <img src="${src}" alt="Изображение">
      </figure>
    `, 'modal-lg');
  },

  // Открыть файл (PDF, DOCX, PPTX и т.д.)
  openFile(src) {
    const ext = src.split('.').pop().toLowerCase();
    let content = '';

    if (ext === 'pdf') {
      content = `<iframe src="${src}" style="width: 100%; height: 80vh; border: none;" frameborder="0"></iframe>`;
    } else {
      content = `
        <div style="text-align: center; padding: 2rem;">
          <p>Предварительный просмотр для этого типа файла недоступен.</p>
          <a href="${src}" download role="button">Скачать файл</a>
        </div>
      `;
    }

    this.showModal(content, 'modal-lg');
  },

  // Открыть видео
  openVideo(src) {
    this.showModal(`
      <figure>
        <video controls autoplay>
          <source src="${src}" type="video/mp4">
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </figure>
    `, 'modal-lg');
  },

  // Показать модальное окно с произвольным контентом
  showModal(content, sizeClass = '') {
    let dialog = document.getElementById('main-modal');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'main-modal';
        document.body.appendChild(dialog);
    }

    dialog.innerHTML = `
      <article class="${sizeClass}">
          <header>
              <a href="#close" aria-label="Close" class="close" onclick="event.preventDefault(); Modals.closeModal()"></a>
          </header>
          <div id="modal-content">
              ${content}
          </div>
      </article>
    `;

    dialog.showModal();
  },

  // Закрыть модальное окно
  closeModal() {
    const dialog = document.getElementById('main-modal');
    if (dialog) {
      dialog.close();
    }
  }
};
