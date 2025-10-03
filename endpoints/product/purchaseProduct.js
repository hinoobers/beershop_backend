const stripe = require("../../stripe");

module.exports = async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Missing products array" });
    }

    const line_items = products.map(product => {
        // Ensure product has required fields
        if (!product.name || typeof product.price !== 'number' || !product.qty) {
            throw new Error("Invalid product format");
        }

        return {
            price_data: {
                currency: "eur",
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100, // amount in cents
            },
            quantity: product.qty,
        };
    });


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['EE', 'LV', 'LT'],
            },
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/afterPayment?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
