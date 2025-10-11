function changeCurrency() {
    const select = document.getElementById('currency-select');
    const selectedCurrency = select.value;
    localStorage.setItem('selectedCurrency', selectedCurrency);
    localStorage.setItem('currencySymbol', select.options[select.selectedIndex].getAttribute('tag'));
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    const select = document.getElementById('currency-select');
    select.value = savedCurrency;
});