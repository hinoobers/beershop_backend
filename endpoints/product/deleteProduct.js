const pool = require("../../database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    pool.query("DELETE FROM products WHERE id=?", [req.params.id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return; 
        }
        res.json({success: true});
    });
}