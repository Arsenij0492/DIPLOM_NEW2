// js/quiz.js
const Quiz = {
    currentQuestion: 1,
    totalQuestions: 4,
    selectedPropertyType: '',

    init: function() {
        console.log('Quiz initialized');
        this.updateProgress();
        this.setupEventListeners();
    },

    updateProgress: function() {
        for (let i = 1; i <= this.totalQuestions; i++) {
            const progressEl = document.getElementById(`progress-${i}`);
            if (progressEl) {
                if (i < this.currentQuestion) {
                    progressEl.className = 'progress-step completed';
                } else if (i === this.currentQuestion) {
                    progressEl.className = 'progress-step active';
                } else {
                    progressEl.className = 'progress-step';
                }
                const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        // Показываем кнопку "Войти" только на первом шаге
        if (this.currentQuestion === 1) {
            loginBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'none';
        }
    }
            }
        }
        
        document.getElementById('current-step').textContent = this.currentQuestion;
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion === 1 ? 'none' : 'inline-block';
        }
        
        if (this.currentQuestion === this.totalQuestions) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-block';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    },

    nextQuestion: function() {
        if (this.currentQuestion < this.totalQuestions) {
            if (this.currentQuestion === 1) {
                const firstName = document.getElementById('first-name')?.value;
                if (!firstName) {
                    alert('Введите имя');
                    return;
                }
            }
            
            if (this.currentQuestion === 2) {
                const selected = document.querySelector('input[name="property-type"]:checked');
                if (!selected) {
                    alert('Выберите тип недвижимости');
                    return;
                }
                this.selectedPropertyType = selected.value;
            }
            
            document.getElementById(`question-${this.currentQuestion}`).classList.remove('active');
            this.currentQuestion++;
            document.getElementById(`question-${this.currentQuestion}`).classList.add('active');
            this.updateProgress();
        }
    },

    prevQuestion: function() {
        if (this.currentQuestion > 1) {
            document.getElementById(`question-${this.currentQuestion}`).classList.remove('active');
            this.currentQuestion--;
            document.getElementById(`question-${this.currentQuestion}`).classList.add('active');
            this.updateProgress();
        }
    },

    submitQuiz: function() {
        const firstName = document.getElementById('first-name')?.value;
        const lastName = document.getElementById('last-name')?.value;
        const selected = document.querySelector('input[name="property-type"]:checked');
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const agree = document.getElementById('agree')?.checked;
        
        if (!firstName) {
            alert('Введите имя');
            this.showQuestion(1);
            return;
        }
        
        if (!selected) {
            alert('Выберите тип недвижимости');
            this.showQuestion(2);
            return;
        }
        
        if (!email && !phone) {
            alert('Укажите email или телефон');
            this.showQuestion(4);
            return;
        }
        
        if (!agree) {
            alert('Необходимо согласие на обработку данных');
            return;
        }
        
        // Сохраняем данные
        const userData = {
            firstName: firstName,
            lastName: lastName || '',
            propertyType: selected.value,
            email: email || '',
            phone: phone || '',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('quizData', JSON.stringify(userData));
        
        // Переходим на страницу благодарности
        window.location.href = 'thank-you.html';
    },

    showQuestion: function(number) {
        document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
        document.getElementById(`question-${number}`).classList.add('active');
        this.currentQuestion = number;
        this.updateProgress();
    },

    setupEventListeners: function() {
        document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitQuiz());
        
        // Логика для "Нет льгот"
        const benefitNone = document.getElementById('benefit-none');
        if (benefitNone) {
            benefitNone.addEventListener('change', function(e) {
                if (e.target.checked) {
                    document.querySelectorAll('.benefit-item input:not(#benefit-none)').forEach(cb => {
                        cb.checked = false;
                    });
                }
            });
        }
        
        // Если выбрали любую другую льготу
        document.querySelectorAll('.benefit-item input:not(#benefit-none)').forEach(cb => {
            cb.addEventListener('change', function() {
                if (this.checked && benefitNone) {
                    benefitNone.checked = false;
                }
            });
        });
        
        // Маска телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = value.substring(1);
                    }
                    let result = '+7 ';
                    if (value.length > 0) {
                        result += '(' + value.substring(0, 3);
                    }
                    if (value.length >= 4) {
                        result += ') ' + value.substring(3, 6);
                    }
                    if (value.length >= 7) {
                        result += '-' + value.substring(6, 8);
                    }
                    if (value.length >= 9) {
                        result += '-' + value.substring(8, 10);
                    }
                    e.target.value = result;
                }
            });
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.questions-container')) {
        Quiz.init();
        window.Quiz = Quiz;
    }
});