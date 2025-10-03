const pool = require("../../database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    const {name, description, image_url, price} = req.body;

    pool.query("INSERT INTO products (name, description, image_url, price) VALUES (?, ?, ?, ?)", [name, description, image_url, price], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return; 
        }
        res.json({success: true});
    });
}