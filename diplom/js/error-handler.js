// Обработка ошибок
window.ErrorHandler = {
    isServerError(error) {
        const messages = [
            'technical issue', 'network error', 'failed to fetch',
            'database error', 'connection refused', 'timeout',
            '500', '502', '503', '504'
        ];
        
        const errorString = JSON.stringify(error).toLowerCase();
        return messages.some(msg => errorString.includes(msg.toLowerCase()));
    },
    
    getMessage(error) {
        if (this.isServerError(error)) {
            return '🛠️ Сервер временно недоступен. Попробуйте через 5 минут.';
        }
        
        if (error?.message?.includes('JWT')) {
            return '🔑 Сессия истекла. Пожалуйста, войдите снова.';
        }
        
        if (error?.message?.includes('permission')) {
            return '🚫 Нет прав для этого действия.';
        }
        
        if (error?.message?.includes('duplicate')) {
            return '📋 Такая запись уже существует.';
        }
        
        return error?.message || 'Произошла неизвестная ошибка';
    },
    
    showErrorToast(error) {
        const message = this.getMessage(error);
        
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                <span style="font-size: 20px;">⚠️</span>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; cursor: pointer; font-size: 18px; color: #999;">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 7000);
    }
};

// Добавляем стили только если их еще нет
if (!document.getElementById('error-handler-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'error-handler-styles';
    styleEl.textContent = `
        .error-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid #FF3B30;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(styleEl);
}