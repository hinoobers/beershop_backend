const pool = require("../../util/database.js");


module.exports = (req, res) => {
    const id = req.params.id;

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
        res.send(results[0]);
    });
};