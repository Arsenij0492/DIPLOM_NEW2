document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('quizData') || '{}');
    
    console.log('User data loaded:', userData);
    
    // Заполняем предпросмотр
    const namePreview = document.getElementById('previewName');
    if (namePreview) {
        namePreview.textContent = userData.firstName 
            ? (userData.firstName + (userData.lastName ? ' ' + userData.lastName : ''))
            : 'Не указано';
    }
    
    const emailPreview = document.getElementById('previewEmail');
    if (emailPreview) {
        emailPreview.textContent = userData.email || 'Не указан';
    }
    
    const phonePreview = document.getElementById('previewPhone');
    if (phonePreview) {
        phonePreview.textContent = userData.phone || 'Не указан';
    }
    
    const propertyTypes = {
        land: 'Земельный участок',
        house: 'Дом с участком',
        townhouse: 'Таунхаус',
        apartment: 'Квартиру'
    };
    
    const propertyPreview = document.getElementById('previewProperty');
    if (propertyPreview && userData.propertyType) {
        propertyPreview.textContent = propertyTypes[userData.propertyType] || 'Недвижимость';
    }
    
    // Ссылка на регистрацию с параметрами
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        const params = new URLSearchParams();
        if (userData.email) params.set('email', userData.email);
        if (userData.phone) params.set('phone', userData.phone);
        if (userData.firstName) params.set('firstName', userData.firstName);
        if (userData.lastName) params.set('lastName', userData.lastName);
        
        registerBtn.href = 'register.html?' + params.toString();
    }
});