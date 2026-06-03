// js/auth.js - исправленная версия

document.addEventListener('DOMContentLoaded', async function() {
    // Убираем логи
    // console.log('Auth.js loaded');
    
    if (typeof window.initSupabase === 'function') {
        window.initSupabase();
    }
    
    // Проверяем пользователя
    const result = await window.getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (result.success && result.user) {
        // Убираем лог
        // console.log('User logged in:', result.user.email);
        updateUserInfo(result.user);
        
        // Если пользователь залогинен и на главной - редирект в дашборд
        if (currentPage === 'index.html') {
            const role = result.user.profile?.role || 'client';
            if (role === 'expert') {
                window.location.href = 'expert-dashboard.html';
            } else if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
            return;
        }
        
        // Если на странице входа/регистрации - тоже редирект
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'dashboard.html';
            return;
        }
    } else {
        // Убираем лог
        // console.log('No user logged in');
        
        // Если пользователь не залогинен и пытается зайти на защищенную страницу
        const protectedPages = ['dashboard.html', 'expert-dashboard.html', 'admin-dashboard.html', 
                               'profile.html', 'application-form.html', 'application-details.html'];
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
});

function updateUserInfo(user) {
    // Пробуем оба варианта классов (для старых и новых страниц)
    const userNameElements = document.querySelectorAll('.user-name, .user-name-header');
    const userRoleElements = document.querySelectorAll('.user-role, .user-role-header');
    
    if (user.profile) {
        const fullName = `${user.profile.last_name || ''} ${user.profile.first_name || ''} ${user.profile.middle_name || ''}`.trim();
        const displayName = fullName || user.email || 'Пользователь';
        
        userNameElements.forEach(el => {
            if (el) el.textContent = displayName;
        });
        
        const roleText = user.profile.role === 'expert' ? 'Кредитный специалист' : 'Клиент';
        userRoleElements.forEach(el => {
            if (el) el.textContent = roleText;
        });
    }
}

window.handleLogout = async function() {
    try {
        if (typeof window.logoutUser !== 'function') {
            console.error('logoutUser function not loaded');
            return;
        }
        
        const result = await window.logoutUser();
        
        if (result.success) {
            // Полная очистка временных данных
            localStorage.clear();
            sessionStorage.clear();
            
            window.location.href = 'index.html';
        } else {
            alert('Ошибка при выходе: ' + result.error);
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Ошибка при выходе из системы');
    }
};

// Добавляем обработчики на кнопки выхода
document.addEventListener('DOMContentLoaded', function() {
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', window.handleLogout);
    });
});

// Убираем последний лог
// console.log('Auth functions loaded');