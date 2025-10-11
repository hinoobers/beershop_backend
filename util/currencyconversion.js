require('dotenv').config();
const API_url = "https://api.freecurrencyapi.com/v1/latest?apikey=" + process.env.CURRENCY_API_KEY;

const convert = async (amount, toCurrency) => {
    let rates = await fetch(API_url);
    rates = await rates.json();

    return (amount * rates.data[toCurrency]);;
}

module.exports = convert;