const pool = require("../../util/database.js");
const isAdmin = require("../login.js").isAdmin;

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }

    const {name, description, image_url, price, fields} = req.body;
    // Validity check
    if (!name || !description || !image_url || !price || !fields) {
        res.status(400).json({ error: "Bad Request: Missing required fields" });
        return;
    }
    
    if(typeof price !== 'number' || price < 0) {
        console.log(typeof price);
        res.status(400).json({ error: "Bad Request: Price must be a non-negative number" });
        return;
    }

    if (!Array.isArray(fields)) {
        res.status(400).json({ error: "Bad Request: Fields must be an array" });
        return;
    }

    if((typeof name !== 'string' || name.length > 100) || (typeof description !== 'string' || description.length > 1000)) {
        res.status(400).json({ error: "Bad Request: Name (max 100 chars) and description (max 1000 chars) must be strings" });
        return;
    }

    pool.query("UPDATE products SET name=?, description=?, image_url=?, price=?, fields=? WHERE id=?", [name, description, image_url, price, JSON.stringify(fields), req.params.id], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return; 
        }
        res.json({success: true});
    });
}