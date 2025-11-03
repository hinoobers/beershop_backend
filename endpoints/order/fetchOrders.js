const pool = require("../../util/database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = async (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [countRows] = await pool.promise().query("SELECT COUNT(*) as count FROM orders");
        const total = countRows[0].count;

        const [results] = await pool.promise().query("SELECT * FROM orders ORDER BY order_id ASC LIMIT ? OFFSET ?", [limit, offset]);
        console.log(results);
        res.json({ data: results, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}