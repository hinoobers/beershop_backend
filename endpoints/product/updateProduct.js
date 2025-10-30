const pool = require("../../util/database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    const {name, description, image_url, price, fields} = req.body;

    pool.query("UPDATE products SET name=?, description=?, image_url=?, price=?, fields=? WHERE id=?", [name, description, image_url, price, fields, req.params.id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return; 
        }
        res.json({success: true});
    });
}