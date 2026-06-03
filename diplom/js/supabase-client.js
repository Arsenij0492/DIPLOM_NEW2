// supabase-client.js - РАБОЧАЯ ВЕРСИЯ (прямая работа с таблицами)

let supabaseInstance = null;

window.initSupabase = function() {
    if (supabaseInstance) return supabaseInstance;
    
    try {
        if (!window.supabase) {
            console.error('Supabase library not loaded');
            return null;
        }
        
        supabaseInstance = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        console.log('✅ Supabase initialized');
        return supabaseInstance;
    } catch (error) {
        console.error('❌ Supabase init error:', error);
        return null;
    }
};

window.getSupabase = function() {
    return supabaseInstance || window.initSupabase();
};

// ===== ПРЯМАЯ РАБОТА С ПОЛЬЗОВАТЕЛЯМИ (без Supabase Auth) =====

// Регистрация через таблицу users
window.registerUser = async function(userData) {
    try {
        const supabase = window.getSupabase();
        if (!supabase) throw new Error('Supabase not initialized');
        
        // Проверяем, не существует ли пользователь
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();
        
        if (existing) {
            return { success: false, error: 'Пользователь с таким email уже существует' };
        }
        
        // Создаём пользователя
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                email: userData.email,
                password: userData.password,
                first_name: userData.firstName,
                last_name: userData.lastName,
                middle_name: userData.middleName || null,
                phone: userData.phone,
                role: 'client',
                status: 'active',
                created_at: new Date()
            }])
            .select()
            .single();
        
        if (insertError) throw insertError;
        
        // Сохраняем в sessionStorage
        sessionStorage.setItem('user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    } catch (error) {
        console.error('❌ Registration error:', error);
        return { success: false, error: error.message };
    }
};

// Вход через таблицу users
window.loginUser = async function(email, password) {
    try {
        const supabase = window.getSupabase();
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('status', 'active')
            .single();
        
        if (error || !data) {
            return { success: false, error: 'Неверный email или пароль' };
        }
        
        // Сохраняем в sessionStorage
        sessionStorage.setItem('user', JSON.stringify(data));
        
        return { success: true, user: data };
    } catch (error) {
        console.error('❌ Login error:', error);
        return { success: false, error: error.message };
    }
};

// Получение текущего пользователя из sessionStorage
window.getCurrentUser = async function() {
    try {
        const saved = sessionStorage.getItem('user');
        if (saved) {
            const user = JSON.parse(saved);
            return { 
                success: true, 
                user: { 
                    ...user, 
                    profile: { 
                        role: user.role,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    } 
                } 
            };
        }
        return { success: true, user: null };
    } catch (error) {
        console.error('❌ Get user error:', error);
        return { success: true, user: null };
    }
};

// Выход
window.logoutUser = async function() {
    try {
        sessionStorage.removeItem('user');
        sessionStorage.clear();
        return { success: true };
    } catch (error) {
        console.error('❌ Logout error:', error);
        return { success: false, error: error.message };
    }
};

// ===== ЗАЯВКИ =====
window.createApplication = async function(applicationData) {
    try {
        const supabase = window.getSupabase();
        if (!supabase) throw new Error('Supabase not initialized');
        
        const user = await window.getCurrentUser();
        if (!user.success || !user.user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const { data, error } = await supabase
            .from('applications')
            .insert([{
                user_id: user.user.id,
                status: 'draft',
                property_price: applicationData.propertyPrice,
                down_payment: applicationData.downPayment,
                loan_term: applicationData.loanTerm,
                region: applicationData.region,
                property_address: applicationData.propertyAddress,
                documents: applicationData.documents || {},
                created_at: new Date(),
                updated_at: new Date()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, application: data[0] };
    } catch (error) {
        console.error('❌ Create application error:', error);
        return { success: false, error: error.message };
    }
};

window.getUserApplications = async function() {
    try {
        const supabase = window.getSupabase();
        const user = await window.getCurrentUser();
        if (!user.user) return { success: true, applications: [] };
        
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return { success: true, applications: data || [] };
    } catch (error) {
        console.error('❌ Get applications error:', error);
        return { success: false, applications: [], error: error.message };
    }
};

window.getAllApplications = async function() {
    try {
        const supabase = window.getSupabase();
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Подгружаем данные пользователей отдельно
        const applications = data || [];
        for (let app of applications) {
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('email, first_name, last_name')
                    .eq('id', app.user_id)
                    .single();
                app.users = userData || { email: 'Неизвестно' };
            } catch(e) {
                app.users = { email: 'Неизвестно' };
            }
        }
        
        return { success: true, applications: applications };
    } catch (error) {
        console.error('❌ Get all applications error:', error);
        return { success: false, applications: [], error: error.message };
    }
};

window.updateApplicationStatus = async function(applicationId, newStatus, comment = '') {
    try {
        const supabase = window.getSupabase();
        const user = await window.getCurrentUser();
        if (!user.success || !user.user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const { error: updateError } = await supabase
            .from('applications')
            .update({ status: newStatus, updated_at: new Date() })
            .eq('id', applicationId);
        
        if (updateError) throw updateError;
        
        return { success: true };
    } catch (error) {
        console.error('❌ Update status error:', error);
        return { success: false, error: error.message };
    }
};

window.deleteApplication = async function(applicationId) {
    try {
        const supabase = window.getSupabase();
        const user = await window.getCurrentUser();
        if (!user.success || !user.user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const { data: app } = await supabase
            .from('applications')
            .select('user_id, status')
            .eq('id', applicationId)
            .single();
        
        if (app.user_id !== user.user.id) {
            throw new Error('Нет прав на удаление');
        }
        
        if (app.status !== 'draft') {
            throw new Error('Можно удалить только черновик');
        }
        
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId);
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('❌ Delete error:', error);
        return { success: false, error: error.message };
    }
};

// ===== ДОКУМЕНТЫ =====
window.saveUserDocument = async function(documentType, documentData) {
    try {
        const supabase = window.getSupabase();
        const user = await window.getCurrentUser();
        if (!user.success || !user.user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const { data: existing } = await supabase
            .from('user_documents')
            .select('id')
            .eq('user_id', user.user.id)
            .eq('document_type', documentType)
            .maybeSingle();
        
        if (existing) {
            await supabase
                .from('user_documents')
                .update({ document_data: documentData, updated_at: new Date() })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('user_documents')
                .insert([{
                    user_id: user.user.id,
                    document_type: documentType,
                    document_data: documentData
                }]);
        }
        
        return { success: true };
    } catch (error) {
        console.error('❌ Save document error:', error);
        return { success: false, error: error.message };
    }
};

// Инициализация
window.initSupabase();
console.log('✅ Supabase client loaded');