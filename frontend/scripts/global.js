function changeCurrency() {
    const select = document.getElementById('currency-select');
    const selectedCurrency = select.value;
    localStorage.setItem('selectedCurrency', selectedCurrency);
    location.reload();
}