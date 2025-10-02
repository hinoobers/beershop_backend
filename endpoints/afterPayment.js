const stripe = require("../stripe");
const pool = require("../database");
const {sendEmail} = require("../emailer");

module.exports = async (req, res) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session) {
            const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
                limit: 100,
            });
            const items = lineItems.data.map(item => ({
                id: item.id,
                name: item.description,
                quantity: item.quantity,
                price: item.amount_total / item.quantity / 100, 
            }));

            const address = session.collected_information.shipping_details.address;
            const email = session.customer_details.email.trim();

            pool.query("INSERT INTO orders (email, products, total, address) VALUES (?, ?, ?, ?)", [email, JSON.stringify(items), session.amount_total, JSON.stringify(address)], (error, results) => {
                if (error) {
                    console.error("Error inserting order:", error);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

            let productsList = "";
            try {
                if (Array.isArray(items)) {
                    productsList = items.map(p => `- ${p.name} x${p.quantity}`).join('\n');
                } else {
                    productsList = JSON.stringify(items);
                }
            } catch (e) {
                productsList = items;
            }
            sendEmail(
                email,
                `Order confirmation ID:${results.insertId}`,
                `We have received your order.\nYour order:\n${productsList}`
            );

            res.redirect("/thankYou.html");
            });
        } else {
            return res.status(404).json({ error: "Session not found" });
        }

    } catch (error) {
        console.error("Error retrieving checkout session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};