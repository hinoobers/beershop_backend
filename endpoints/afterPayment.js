const stripe = require("../util/stripe");
const pool = require("../util/database");
const {sendEmail} = require("../util/emailer");
const paypal = require("../util/paypal");

module.exports = async (req, res) => {
    const sessionId = req.query.session_id;

    if (!sessionId && req.query.paymentId && req.query.PayerID) {
        const execute_payment_json = {
            payer_id: req.query.PayerID
        };

        return paypal.payment.execute(req.query.paymentId, execute_payment_json, (error, payment) => {
            if (error) {
                console.error(error.response);
                return res.status(500).json({ error: "PayPal execution failed" });
            }

            if (payment.state !== "approved") {
                return res.status(400).json({ error: "Payment not approved" });
            }

            try {
                const payerEmail = payment.payer.payer_info.email;
                const shippingAddress = payment.payer.payer_info.shipping_address || {};
                const transaction = payment.transactions[0];

                const items = transaction.item_list.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                }));

                const total = parseFloat(transaction.amount.total) * 100; // match Stripe cents convention

                pool.query(
                    "INSERT INTO orders (email, products, total, address) VALUES (?, ?, ?, ?)",
                    [payerEmail, JSON.stringify(items), total, JSON.stringify(shippingAddress)],
                    (err, results) => {
                        if (err) {
                            console.error("Error inserting PayPal order:", err);
                            return res.status(500).json({ error: "Internal Server Error" });
                        }

                        const productsList = items
                            .map(p => `- ${p.name} x${p.quantity}`)
                            .join("\n");

                        sendEmail(
                            payerEmail,
                            `Order confirmation ID:${results.insertId}`,
                            `We have received your PayPal order.\nYour order:\n${productsList}`
                        );

                        return res.redirect("/thankYou.html");
                    }
                );
            } catch (err) {
                console.error("PayPal post-processing error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }

    if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id/paymentId" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
            limit: 100,
        });

        const items = lineItems.data.map(item => ({
            id: item.id,
            name: item.description,
            quantity: item.quantity,
            price: item.amount_total / item.quantity / 100,
        }));

        const address = session.collected_information?.shipping_details?.address || {};
        const email = session.customer_details?.email?.trim() || "unknown";


        pool.query(
            "INSERT INTO orders (email, products, total, address) VALUES (?, ?, ?, ?)",
            [email, JSON.stringify(items), session.amount_total, JSON.stringify(address)],
            (error, results) => {
            if (error) {
                console.error("Error inserting order:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            let productsList = "";
            try {
                productsList = Array.isArray(items)
                ? items.map(p => `- ${p.name} x${p.quantity}`).join("\n")
                : JSON.stringify(items);
            } catch {
                productsList = items;
            }

            sendEmail(
                email,
                `Order confirmation ID:${results.insertId}`,
                `We have received your order.\nYour order:\n${productsList}`
            );

            return res.redirect("/thankYou.html");
            }
        );
    } catch (error) {
        console.error("Error retrieving checkout session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};