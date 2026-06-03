// register.js - регистрация через прямую вставку в таблицу users

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    
    // Предзаполняем поля из опросника
    const email = params.get('email');
    const phone = params.get('phone');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    
    if (email) document.getElementById('email').value = email;
    if (phone) document.getElementById('phone').value = phone;
    if (firstName) document.getElementById('firstName').value = firstName;
    if (lastName) document.getElementById('lastName').value = lastName;
    
    if (email || phone) {
        const banner = document.getElementById('prefilledBanner');
        if (banner) banner.style.display = 'flex';
    }
    
    // Маска телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') value = value.substring(1);
                let result = '+7 ';
                if (value.length > 0) result += '(' + value.substring(0, 3);
                if (value.length >= 4) result += ') ' + value.substring(3, 6);
                if (value.length >= 7) result += '-' + value.substring(6, 8);
                if (value.length >= 9) result += '-' + value.substring(8, 10);
                e.target.value = result;
            }
        });
    }
    
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('passwordConfirm').value;
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value;
            
            if (password.length < 6) {
                alert('Пароль должен быть не менее 6 символов');
                return;
            }
            
            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }
            
            try {
                if (window.Loader) window.Loader.show('Регистрация...');
                
                const result = await window.registerUser({
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone
                });
                
                if (result.success) {
                    if (window.Loader) window.Loader.success('Успешно!');
                    localStorage.removeItem('quizData');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html?new=true';
                    }, 1000);
                } else {
                    if (window.Loader) window.Loader.hide();
                    if (result.error && result.error.includes('существует')) {
                        if (confirm('Пользователь уже существует. Войти?')) {
                            window.location.href = 'login.html';
                        }
                    } else {
                        alert('Ошибка: ' + result.error);
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (window.Loader) window.Loader.hide();
                alert('Ошибка при регистрации');
            }
        });
    }
});