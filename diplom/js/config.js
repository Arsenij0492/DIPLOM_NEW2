// Конфигурация Supabase
const SUPABASE_CONFIG = {
    url: 'https://azpfhcmpamkaebghlwah.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cGZoY21wYW1rYWViZ2hsd2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTI0MDUsImV4cCI6MjA4NzQyODQwNX0.3arKaqGskDPbW6gSsy2H6-MOuAymOnNG_DoC60rvwgI'
};

// Константы приложения
const APP_CONFIG = {
    appName: 'Кубань Кредит | Сельская ипотека',
    minLoanTerm: 1,
    maxLoanTerm: 30,
    minDownPaymentPercent: 10,
    maxPropertyPrice: 10000000,
    
    applicationStatuses: {
        draft: 'Черновик',
        submitted: 'На рассмотрении',
        documents_check: 'Проверка документов',
        approved: 'Одобрена',
        rejected: 'Отказано',
        need_docs: 'Требуются документы'
    }
};

// Делаем конфиги глобальными
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.APP_CONFIG = APP_CONFIG;