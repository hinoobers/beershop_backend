const pool = require("../../util/database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    const {name, description, image_url, price, fields} = req.body;

    if(!Array.isArray(fields)) {
        res.status(400).json({ error: "Bad Request: Fields must be an array" });
        return;
    }

    pool.query("INSERT INTO products (name, description, image_url, price, fields) VALUES (?, ?, ?, ?, ?)", [name, description, image_url, price, JSON.stringify(fields)], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return; 
        }
        res.json({success: true});
    });
}