const pool = require("../../util/database.js");


module.exports = (req, res) => {
    const id = req.params.id;
    const currency = req.query.currency || 'USD';
    const currencyMap = {'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr', 'NZD': 'NZ$'};

    if(!currencyMap[currency]) {
        return res.status(400).json({ error: "Unsupported currency" });
    }

    pool.query("SELECT * FROM products WHERE id=?", [id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        results[0].price = {
            total: parseFloat(results[0].price.toFixed(2)),
            currency: currencyMap[currency],
            text: currencyMap[currency] == "$" ? "${price}" : "{price}" + currencyMap[currency]
        }
        res.send(results[0]);
    });
};