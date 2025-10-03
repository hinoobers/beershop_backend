const pool = require("../../database.js");

module.exports = (req, res) => {
    pool.query("SELECT * FROM products", (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(results);
    });
}