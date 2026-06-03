// Логика профиля и документов
async function loadUserDocuments() {
    const user = await window.getCurrentUser();
    if (!user.success || !user.user) return;
    
    const supabase = window.getSupabase();
    
    // Загрузка паспорта
    const { data: passport } = await supabase
        .from('user_documents')
        .select('document_data')
        .eq('user_id', user.user.id)
        .eq('document_type', 'passport')
        .maybeSingle();
    
    if (passport?.document_data) {
        const data = passport.document_data;
        document.getElementById('passport-series').value = data.series || '';
        document.getElementById('passport-number').value = data.number || '';
        // ... остальные поля
        document.getElementById('passport-status').className = 'status-badge status-approved';
        document.getElementById('passport-status').textContent = 'Заполнен';
    }
    
    // Аналогично для СНИЛС
    const { data: snils } = await supabase
        .from('user_documents')
        .select('document_data')
        .eq('user_id', user.user.id)
        .eq('document_type', 'snils')
        .maybeSingle();
    
    if (snils?.document_data) {
        document.getElementById('snils-number').value = snils.document_data.number || '';
        document.getElementById('snils-status').className = 'status-badge status-approved';
        document.getElementById('snils-status').textContent = 'Заполнен';
    }
}

async function savePassport() {
    const passportData = {
        series: document.getElementById('passport-series').value,
        number: document.getElementById('passport-number').value,
        issued: document.getElementById('passport-issued').value,
        date: document.getElementById('passport-date').value,
        code: document.getElementById('passport-code').value,
        birthplace: document.getElementById('passport-birthplace').value,
        address: document.getElementById('passport-address').value
    };
    
    if (!passportData.series || !passportData.number) {
        alert('Заполните серию и номер паспорта');
        return;
    }
    
    const result = await window.saveUserDocument('passport', passportData);
    if (result.success) {
        alert('Паспорт сохранен!');
        location.reload();
    } else {
        alert('Ошибка: ' + result.error);
    }
}

async function saveSnils() {
    const snilsData = {
        number: document.getElementById('snils-number').value
    };
    
    if (!snilsData.number) {
        alert('Введите номер СНИЛС');
        return;
    }
    
    const result = await window.saveUserDocument('snils', snilsData);
    if (result.success) {
        alert('СНИЛС сохранен!');
        location.reload();
    } else {
        alert('Ошибка: ' + result.error);
    }
}

document.addEventListener('DOMContentLoaded', loadUserDocuments);
window.savePassport = savePassport;
window.saveSnils = saveSnils;