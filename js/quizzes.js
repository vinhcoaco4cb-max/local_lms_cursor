/**
 * QUIZZES.JS — Центральный модуль для тестов
 * Определяет тип теста и вызывает нужный модуль для рендеринга и обработки
 */
const Quizzes = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: [],
  startTime: null,
  timerInterval: null,
  onCompleteCallback: null,

  render(quiz, onComplete) {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      alert('Ошибка: тест не содержит вопросов.');
      return;
    }

    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.startTime = Date.now();
    this.onCompleteCallback = onComplete;
    
    this.userAnswers = new Array(quiz.questions.length).fill(null);
    this.renderQuestion();
  },

  renderQuestion() {
      const quiz = this.currentQuiz;
      const question = quiz.questions[this.currentQuestionIndex];
      const app = document.getElementById('app');
      
      if (this.timerInterval) {
          clearInterval(this.timerInterval);
      }
      
      let html = `
          <header class="page-header">
              <h2>${quiz.title}</h2>
              <div class="quiz-header-info">
                  <span>Вопрос ${this.currentQuestionIndex + 1} из ${quiz.questions.length}</span>
                  ${quiz.timeLimit > 0 ? `<span id="timer" class="quiz-timer ml-10">${quiz.timeLimit} сек</span>` : ''}
              </div>
          </header>
          <div class="content-section" id="quizContent">
              <div class="card">
                  <h3>${question.question || question.text}</h3>
                  <div id="questionContainer"></div>
                  <div class="button-group mt-30 justify-between">
                      <button onclick="Quizzes.cancelQuiz()" class="btn btn-secondary">Отмена</button>
                      <button id="nextBtn" class="btn btn-primary" disabled>${this.currentQuestionIndex === quiz.questions.length - 1 ? 'Завершить тест' : 'Далее'}</button>
                  </div>
              </div>
          </div>
      `;
      app.innerHTML = html;

      const questionContainer = document.getElementById('questionContainer');
      
      switch (question.type) {
          case 'single':
              questionContainer.innerHTML = QuizTypes.single.render(question);
              break;
          case 'multiple':
              questionContainer.innerHTML = QuizTypes.multiple.render(question);
              break;
          case 'dragdrop':
          case 'dragdrop-categories':
              questionContainer.innerHTML = QuizTypes.dragdrop.render(question);
              break;
          case 'fillblank':
              questionContainer.innerHTML = QuizTypes.fillblank.render(question);
              break;
          case 'sequence':
              questionContainer.innerHTML = QuizTypes.sequence.render(question);
              break;
          case 'hotspot':
          case 'hotspot-multiple':
          case 'hotspot-sequence':
              questionContainer.innerHTML = QuizTypes.hotspot.render(question);
              break;
          case 'truefalse':
              questionContainer.innerHTML = QuizTypes.truefalse.render(question);
              break;
          default:
              questionContainer.innerHTML = '<p>Неизвестный тип вопроса</p>';
      }

      this.initQuestionInteractions(question);

      if (quiz.timeLimit > 0) {
          this.startTimer(quiz.timeLimit);
      }
  },

  initQuestionInteractions(question) {
      const nextBtn = document.getElementById('nextBtn');
      
      switch (question.type) {
          case 'single':
              QuizTypes.single.init(question, nextBtn, (answer) => {
                  this.userAnswers[this.currentQuestionIndex] = answer;
              });
              break;
          case 'multiple':
              QuizTypes.multiple.init(question, nextBtn, (answers) => {
                  this.userAnswers[this.currentQuestionIndex] = answers;
              });
              break;
          case 'dragdrop':
          case 'dragdrop-categories':
              QuizTypes.dragdrop.init(question, nextBtn, (answers) => {
                  this.userAnswers[this.currentQuestionIndex] = answers;
              });
              break;
          case 'fillblank':
              QuizTypes.fillblank.init(question, nextBtn, (answer) => {
                  this.userAnswers[this.currentQuestionIndex] = answer;
              });
              break;
          case 'sequence':
              QuizTypes.sequence.init(question, nextBtn, (order) => {
                  this.userAnswers[this.currentQuestionIndex] = order;
              });
              break;
          case 'hotspot':
          case 'hotspot-multiple':
          case 'hotspot-sequence':
              QuizTypes.hotspot.init(question, nextBtn, (click) => {
                  this.userAnswers[this.currentQuestionIndex] = click;
              });
              break;
          case 'truefalse':
              QuizTypes.truefalse.init(question, nextBtn, (answer) => {
                  this.userAnswers[this.currentQuestionIndex] = answer;
              });
              break;
      }

      nextBtn.addEventListener('click', () => {
          if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
              this.currentQuestionIndex++;
              this.renderQuestion();
          } else {
              this.finishQuiz();
          }
      });
  },

  cancelQuiz() {
      if (Core.state.currentCourseId && Core.state.currentLessonId) {
          Core.setView('lesson', { currentCourseId: Core.state.currentCourseId, currentLessonId: Core.state.currentLessonId });
      } else if (Core.state.currentCourseId) {
          Core.setView('course', { currentCourseId: Core.state.currentCourseId });
      } else {
          Core.setView('home');
      }
  },

  startTimer(seconds) {
      let remaining = seconds;
      const timerElement = document.getElementById('timer');
      
      this.timerInterval = setInterval(() => {
          remaining--;
          timerElement.textContent = `${remaining} сек`;
          
          if (remaining <= 0) {
              clearInterval(this.timerInterval);
              this.finishQuiz();
          }
      }, 1000);
  },

  finishQuiz() {
      if (this.timerInterval) {
          clearInterval(this.timerInterval);
      }
      
      const quiz = this.currentQuiz;
      let totalCorrect = 0;
      
      quiz.questions.forEach((question, index) => {
          const userAnswer = this.userAnswers[index];
          console.log('Current Question:', question); // Логируем весь объект вопроса
          if (!question.type || !QuizTypes[question.type]) {
              console.error(`Ошибка: Неизвестный или неопределенный тип вопроса: ${question.type}`, question);
              return; // Пропускаем этот вопрос
          }
          const validator = QuizTypes[question.type].validate;
          if (validator(question, userAnswer)) {
              totalCorrect++;
          }
      });
      
      const finalScore = (totalCorrect / quiz.questions.length) * 100;

      const result = {
          score: Math.round(finalScore),
          passed: finalScore >= quiz.passingScore,
          answers: [...this.userAnswers],
          timeSpent: Date.now() - this.startTime
      };
      
      if (this.onCompleteCallback) {
          this.onCompleteCallback(result);
      }
  }
};

const QuizTypes = {};