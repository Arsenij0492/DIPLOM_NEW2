// Логика создания и редактирования заявок
async function loadApplicationForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) return;
    
    const supabase = window.getSupabase();
    const user = await window.getCurrentUser();
    
    if (!user.success || !user.user) return;
    
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();
    
    if (error) {
        alert('Заявка не найдена');
        return;
    }
    
    // Заполняем форму
    document.getElementById('property-price').value = data.property_price;
    document.getElementById('down-payment').value = data.down_payment;
    document.getElementById('loan-term').value = data.loan_term;
    document.getElementById('region').value = data.region;
    document.getElementById('property-address').value = data.property_address;
    
    if (data.documents) {
        if (data.documents.passport) {
            document.getElementById('app-passport-series').value = data.documents.passport.series || '';
            // ... остальные поля
        }
        if (data.documents.snils) {
            document.getElementById('app-snils-number').value = data.documents.snils.number || '';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadApplicationForEdit);