// Система загрузки
const Loader = {
    element: null,
    timeoutId: null,
    
    init() {
        if (!document.getElementById('global-loader')) {
            const loaderHTML = `
                <div id="global-loader" class="global-loader">
                    <div class="loader-content">
                        <div class="loader-spinner"></div>
                        <div class="loader-text" id="loader-text">Загрузка...</div>
                        <div class="loader-progress">
                            <div class="loader-progress-bar" id="loader-progress-bar"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHTML);
        }
        
        this.element = document.getElementById('global-loader');
        return this;
    },
    
    show(message = 'Загрузка...', progress = 0) {
        if (!this.element) this.init();
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        const textEl = document.getElementById('loader-text');
        const progressBar = document.getElementById('loader-progress-bar');
        
        if (textEl) {
            textEl.textContent = message;
            textEl.style.animation = 'pulse 1s infinite';
        }
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        this.element.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        if (progress < 90) {
            this.timeoutId = setTimeout(() => {
                if (progress < 90) {
                    this.updateProgress(90);
                    this.updateMessage('Почти готово...');
                }
            }, 5000);
        }
        
        return this;
    },
    
    updateProgress(progress) {
        const progressBar = document.getElementById('loader-progress-bar');
        if (progressBar) progressBar.style.width = progress + '%';
        return this;
    },
    
    updateMessage(message) {
        const textEl = document.getElementById('loader-text');
        if (textEl) textEl.textContent = message;
        return this;
    },
    
    hide() {
        if (this.element) {
            this.element.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                this.element.style.display = 'none';
                this.element.style.animation = '';
                document.body.style.overflow = '';
            }, 300);
        }
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        return this;
    },
    
    async withLoader(action, message = 'Загрузка...', options = {}) {
        const { showProgress = true, timeout = 30000 } = options;
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), timeout);
        });
        
        try {
            this.show(message, 0);
            
            let interval;
            if (showProgress) {
                interval = setInterval(() => {
                    const progress = Math.min(parseInt(document.getElementById('loader-progress-bar')?.style.width || '0'), 90);
                    this.updateProgress(Math.min(progress + 5, 90));
                }, 300);
            }
            
            const result = await Promise.race([action(), timeoutPromise]);
            
            if (interval) clearInterval(interval);
            
            if (showProgress) {
                this.updateProgress(100);
                this.updateMessage('Готово!');
                await new Promise(r => setTimeout(r, 500));
            }
            
            this.hide();
            return result;
            
        } catch (error) {
            this.hide();
            if (error.message === 'timeout') {
                throw new Error('Время ожидания истекло');
            }
            throw error;
        }
    },
    
    success(message = 'Успешно!') {
        const textEl = document.getElementById('loader-text');
        if (textEl) {
            textEl.innerHTML = '✓ ' + message;
            textEl.style.color = '#00C853';
        }
        
        const spinner = document.querySelector('.loader-spinner');
        if (spinner) {
            spinner.style.animation = 'none';
            spinner.innerHTML = '✓';
            spinner.style.fontSize = '30px';
            spinner.style.color = '#00C853';
        }
        
        setTimeout(() => this.hide(), 1000);
    },
    
    error(message = 'Ошибка!') {
        const textEl = document.getElementById('loader-text');
        if (textEl) {
            textEl.innerHTML = '✗ ' + message;
            textEl.style.color = '#FF3B30';
        }
        
        const spinner = document.querySelector('.loader-spinner');
        if (spinner) {
            spinner.style.animation = 'none';
            spinner.innerHTML = '✗';
            spinner.style.fontSize = '30px';
            spinner.style.color = '#FF3B30';
        }
        
        setTimeout(() => this.hide(), 2000);
    }
};

// Добавляем стили только если их еще нет
if (!document.getElementById('loader-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'loader-styles';
    styleEl.textContent = `
        .global-loader {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .loader-content {
            text-align: center;
        }
        
        .loader-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #E5E9F0;
            border-top-color: #0047AB;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .loader-text {
            font-size: 18px;
            color: #1A2B3E;
            margin-bottom: 15px;
        }
        
        .loader-progress {
            width: 300px;
            height: 6px;
            background: #E5E9F0;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .loader-progress-bar {
            height: 100%;
            background: #0047AB;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(styleEl);
}

document.addEventListener('DOMContentLoaded', () => Loader.init());
window.Loader = Loader;