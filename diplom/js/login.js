// login.js - вход через прямую работу с таблицей users

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }
        
        try {
            if (window.Loader) window.Loader.show('Вход...');
            
            const result = await window.loginUser(email, password);
            
            if (result.success) {
                if (window.Loader) window.Loader.success('Успешно!');
                localStorage.removeItem('quizData');
                
                const role = result.user.role || 'client';
                
                setTimeout(() => {
                    if (role === 'expert') {
                        window.location.href = 'expert-dashboard.html';
                    } else if (role === 'admin') {
                        window.location.href = '../admin/admin-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } else {
                if (window.Loader) window.Loader.hide();
                alert('Ошибка входа: ' + (result.error || 'Неверный email или пароль'));
            }
        } catch (error) {
            console.error('Login error:', error);
            if (window.Loader) window.Loader.hide();
            alert('Ошибка при входе');
        }
    });
});