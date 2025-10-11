const pool = require("../util/database.js");

const tokens = {};

const login = (req, res) => {
    const { username, password } = req.body;

    pool.query("SELECT * FROM admins WHERE username = ? AND password = ?", [username, password], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        
        if (results.length > 0) {
            const token = generateToken();
            tokens[token] = { username };
            console.log("Admin logged in:", username);
            res.json({ message: "Login successful", token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
};
function generateToken() {
    return Math.random().toString(36);
}

function isAdmin(token) {
    return tokens.hasOwnProperty(token);
}

module.exports = { login, isAdmin };