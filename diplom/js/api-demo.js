// api-demo.js - Демонстрация работы с API ЦБ РФ

window.getCbrRates = async function() {
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        if (response.ok) {
            const data = await response.json();
            return [
                { code: 'USD', name: 'Доллар США', value: data.Valute.USD.Value.toFixed(2) },
                { code: 'EUR', name: 'Евро', value: data.Valute.EUR.Value.toFixed(2) },
                { code: 'CNY', name: 'Китайский юань', value: data.Valute.CNY.Value.toFixed(2) }
            ];
        } else {
            throw new Error('API недоступно');
        }
    } catch (error) {
        // Демо-данные если API недоступно
        return [
            { code: 'USD', name: 'Доллар США', value: '92.50' },
            { code: 'EUR', name: 'Евро', value: '100.20' },
            { code: 'CNY', name: 'Китайский юань', value: '12.80' }
        ];
    }
};

window.getKeyRate = async function() {
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        if (response.ok) {
            return '16.00';
        } else {
            throw new Error('API недоступно');
        }
    } catch (error) {
        return '16.00';
    }
};

window.calculateMortgagePayment = function(amount, years, keyRate) {
    const monthlyRate = (parseFloat(keyRate) + 2) / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) return Math.round(amount / months);
    
    const payment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(payment);
};

window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

window.updateMortgageCalculator = async function() {
    const amountInput = document.getElementById('calc-amount');
    const yearsInput = document.getElementById('calc-years');
    const resultElement = document.getElementById('calc-result');
    
    if (!amountInput || !yearsInput || !resultElement) return;
    
    const amount = parseFloat(amountInput.value) || 3000000;
    const years = parseInt(yearsInput.value) || 10;
    
    // Используем фиксированную ставку 2.5% для сельской ипотеки
    const rate = 2.5;
    
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
    } else {
        monthlyPayment = amount / months;
    }
    
    const totalPayment = monthlyPayment * months;
    const overpayment = totalPayment - amount;
    
    resultElement.innerHTML = `
        <div class="calc-result-item">
            <span class="calc-label">Ежемесячный платёж:</span>
            <span class="calc-value">${window.formatCurrency(Math.round(monthlyPayment))}</span>
        </div>
        <div class="calc-result-item">
            <span class="calc-label">Общая сумма выплат:</span>
            <span class="calc-value">${window.formatCurrency(Math.round(totalPayment))}</span>
        </div>
        <div class="calc-result-item">
            <span class="calc-label">Переплата:</span>
            <span class="calc-value">${window.formatCurrency(Math.round(overpayment))}</span>
        </div>
        <div class="calc-result-item">
            <span class="calc-label">Ставка:</span>
            <span class="calc-value">${rate}% (льготная)</span>
        </div>
    `;
};

console.log('API demo functions loaded');