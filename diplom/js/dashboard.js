// dashboard.js - оптимизированная версия

const Dashboard = {
    currentUser: null,
    isLoading: false,
    
    init: async function() {
        if (this.isLoading) return;
        this.isLoading = true;
        
        try {
            const userResult = await window.getCurrentUser();
            if (userResult.success && userResult.user) {
                this.currentUser = userResult.user;
                
                // Загружаем заявки и документы параллельно
                await Promise.all([
                    this.loadApplications(),
                    this.checkMissingDocuments()
                ]);
            }
        } catch (error) {
            console.error('Dashboard init error:', error);
        } finally {
            this.isLoading = false;
            if (window.Loader) window.Loader.hide();
        }
    },
    
    checkMissingDocuments: async function() {
        const container = document.getElementById('missing-documents');
        if (!container) return;
        
        try {
            const supabase = window.getSupabase();
            if (!supabase) {
                container.style.display = 'none';
                return;
            }
            
            // Устанавливаем таймаут 3 секунды
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null }), 3000));
            
            const [passportRes, snilsRes] = await Promise.all([
                Promise.race([supabase.from('user_documents').select('*').eq('user_id', this.currentUser.id).eq('document_type', 'passport').maybeSingle(), timeoutPromise]),
                Promise.race([supabase.from('user_documents').select('*').eq('user_id', this.currentUser.id).eq('document_type', 'snils').maybeSingle(), timeoutPromise])
            ]);
            
            const passportMissing = !passportRes?.data;
            const snilsMissing = !snilsRes?.data;
            
            if (passportMissing || snilsMissing) {
                container.style.display = 'block';
                const count = (passportMissing ? 1 : 0) + (snilsMissing ? 1 : 0);
                const badge = container.querySelector('.badge');
                if (badge) badge.textContent = `${count} из 2 не заполнено`;
            } else {
                container.style.display = 'none';
            }
        } catch (error) {
            console.log('Documents check skipped:', error);
            container.style.display = 'none';
        }
    },
    
    loadApplications: async function() {
        const container = document.getElementById('applications-container');
        if (!container) return;
        
        try {
            // Таймаут для загрузки заявок
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ success: true, applications: [] }), 5000));
            
            const result = await Promise.race([window.getUserApplications(), timeoutPromise]);
            
            if (result.success && result.applications && result.applications.length > 0) {
                let html = '<div class="applications-grid">';
                
                result.applications.forEach(app => {
                    const status = window.APP_CONFIG?.applicationStatuses[app.status] || app.status;
                    const statusClass = this.getStatusClass(app.status);
                    
                    html += `
                        <div class="application-card">
                            <div class="app-header">
                                <span class="app-id">#${app.id.slice(0,8)}</span>
                                <span class="status-badge ${statusClass}">${status}</span>
                            </div>
                            <div class="app-body">
                                <div class="app-detail">
                                    <span class="detail-label">Сумма:</span>
                                    <span class="detail-value">${this.formatCurrency(app.property_price)}</span>
                                </div>
                                <div class="app-detail">
                                    <span class="detail-label">Взнос:</span>
                                    <span class="detail-value">${this.formatCurrency(app.down_payment)}</span>
                                </div>
                                <div class="app-detail">
                                    <span class="detail-label">Срок:</span>
                                    <span class="detail-value">${app.loan_term} лет</span>
                                </div>
                            </div>
                            <div class="app-footer">
                                <a href="application-details.html?id=${app.id}" class="btn btn-secondary btn-sm">Подробнее</a>
                                ${app.status === 'draft' ? `
                                    <button class="btn btn-primary btn-sm" onclick="Dashboard.submitApplication('${app.id}')">Отправить</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                container.innerHTML = html;
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>У вас пока нет заявок</p>
                        <a href="application-form.html" class="btn btn-primary">Создать первую заявку</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            container.innerHTML = '<p class="text-muted">Загрузка заявок...</p>';
        }
    },
    
    submitApplication: async function(applicationId) {
        if (!confirm('Отправить заявку на проверку?')) return;
        
        try {
            if (window.Loader) window.Loader.show('Отправка...');
            const result = await window.updateApplicationStatus(applicationId, 'submitted', 'Заявка отправлена');
            if (result.success) {
                await this.loadApplications();
                if (window.Loader) window.Loader.success('Отправлено!');
            }
        } catch (error) {
            alert('Ошибка при отправке');
            if (window.Loader) window.Loader.hide();
        }
    },
    
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    },
    
    getStatusClass: function(status) {
        const classes = {
            draft: 'status-draft',
            submitted: 'status-submitted',
            documents_check: 'status-documents',
            approved: 'status-approved',
            rejected: 'status-rejected',
            need_docs: 'status-need-docs'
        };
        return classes[status] || 'status-default';
    }
};

// Инициализация только если есть контейнер
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('applications-container')) {
        Dashboard.init();
        window.Dashboard = Dashboard;
    }
});