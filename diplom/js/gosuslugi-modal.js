// gosuslugi-modal.js - Имитация входа через Госуслуги

window.openGosuslugiModal = function() {
    const modal = document.getElementById('gosuslugi-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeGosuslugiModal = function() {
    const modal = document.getElementById('gosuslugi-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.selectGosuslugiUser = async function(type) {
    window.closeGosuslugiModal();
    
    try {
        let email, password;
        
        switch(type) {
            case 'client':
                email = 'client@test.ru';
                password = 'password123';
                break;
            case 'expert':
                email = 'expert@test.ru';
                password = 'password123';
                break;
            case 'new':
                const mockUserData = {
                    email: `user_${Date.now()}@gosuslugi.ru`,
                    password: 'password123',
                    firstName: 'Пётр',
                    lastName: 'Петров',
                    middleName: 'Петрович',
                    phone: '+7 (999) 123-45-67'
                };
                
                if (typeof window.registerUser !== 'function') {
                    alert('Ошибка загрузки модуля регистрации');
                    return;
                }
                
                const regResult = await window.registerUser(mockUserData);
                
                if (regResult.success) {
                    alert('Пользователь создан! Выполняется вход...');
                    if (typeof window.loginUser !== 'function') {
                        return;
                    }
                    const loginResult = await window.loginUser(mockUserData.email, mockUserData.password);
                    if (loginResult.success) {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    alert('Ошибка при создании пользователя: ' + regResult.error);
                }
                return;
        }
        
        if (typeof window.loginUser !== 'function') {
            alert('Ошибка загрузки модуля входа');
            return;
        }
        
        const result = await window.loginUser(email, password);
        
        if (result.success) {
            if (type === 'expert') {
                window.location.href = 'expert-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert('Ошибка входа: ' + result.error);
        }
    } catch (error) {
        console.error('Gosuslugi error:', error);
        alert('Ошибка при входе через Госуслуги');
    }
};

// Закрытие модалки по клику вне её
window.onclick = function(event) {
    const modal = document.getElementById('gosuslugi-modal');
    if (event.target === modal) {
        window.closeGosuslugiModal();
    }
};

console.log('Gosuslugi modal loaded');