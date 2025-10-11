const pool = require("../../util/database.js");
const convert = require("../../util/currencyconversion.js");

module.exports = async (req, res) => {
    const currency = req.query.currency || 'USD';
    const currencyMap = {'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr', 'NZD': 'NZ$'};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [countRows] = await pool.promise().query("SELECT COUNT(*) as count FROM products");
        const total = countRows[0].count;

        const [results] = await pool.promise().query("SELECT * FROM products ORDER BY id ASC LIMIT ? OFFSET ?", [limit, offset]);

        if (currency !== 'USD') {
            const convertedResults = await Promise.all(results.map(async (product) => {
                const convertedPrice = await convert(product.price, currency);
                return { ...product, price: { total: parseFloat(convertedPrice.toFixed(2)), currency: currencyMap[currency] || currency } };
            }));
            res.json({ data: convertedResults, total });
            return;
        }

        res.json({ data: results.map(product => ({ ...product, price: { total: parseFloat(product.price.toFixed(2)), currency: '$' } })), total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}