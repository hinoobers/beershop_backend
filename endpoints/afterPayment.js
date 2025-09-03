const stripe = require("../stripe");
const pool = require("../database");

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

            pool.query("INSERT INTO orders (products, total, address) VALUES (?, ?, ?)", [JSON.stringify(items), session.amount_total, JSON.stringify(address)], (error, results) => {
                if (error) {
                    console.error("Error inserting order:", error);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

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