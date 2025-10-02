const pool = require("../database.js");
const isAdmin = require("./login.js").isAdmin;
const {sendEmail} = require("../emailer.js");

module.exports = (req, res) => {
    const token = req.headers["authorization"];
    if(!isAdmin(token)) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    pool.query("UPDATE orders SET status = 1 WHERE order_id = ?", [req.body.orderId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        pool.query("SELECT email,products FROM orders WHERE order_id = ?", [req.body.orderId], (error, results) => {
            if(error) {
                console.error(error);
                res.status(500).json({error: "Internal Server Error"});
                return
            }

            let productsList = "";
            try {
                const products = JSON.parse(results[0].products);
                if (Array.isArray(products)) {
                    productsList = products.map(p => `- ${p.name} x${p.quantity}`).join('\n');
                } else {
                    productsList = results[0].products;
                }
            } catch (e) {
                productsList = results[0].products;
            }
            sendEmail(
                results[0].email,
                `Order update ID:${req.body.orderId}`,
                `Your order has been marked as complete.\nYour order:\n${productsList}`
            );
        });
        res.json({ message: "Order marked as done" });
    });
}