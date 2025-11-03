const stripe = require("../../util/stripe");
const paypal = require("../../util/paypal");
const pool = require("../../util/database.js");
require("dotenv").config();

module.exports = async (req, res) => {
    const { products, paymentMethod } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Missing products array" });
    }



    const getProductById = (productId) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM products WHERE id=?", [productId], (error, results) => {
                if (error) return reject(error);
                if (results.length === 0) return reject(new Error(`Product with ID ${productId} not found`));
                resolve(results[0]);
            });
        });
    };

    if(['paypal', 'stripe'].indexOf(paymentMethod) === -1) {
        return res.status(400).json({ error: "Invalid payment method" });
    }

    let line_items = [];
    if(paymentMethod === 'paypal') {
        // Paypal handling
        for (const product of products) {
            if (!product.productId || !product.qty) {
                return res.status(400).json({ error: "Invalid product format" });
            }

            const dbProduct = await getProductById(product.productId);

            line_items.push({
                name: dbProduct.name,
                sku: dbProduct.id.toString(),
                price: dbProduct.price.toFixed(2),
                currency: "USD",
                quantity: product.qty
            });
        }

        if(line_items.reduce((acc, item) => acc + item.price * item.quantity, 0) < process.env.MIN_PRICE_USD) {
            return res.status(400).json({ error: `Minimum order amount is $${process.env.MIN_PRICE_USD}` });
        }

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://192.168.33.150:3001/afterPayment",
                "cancel_url": "http://192.168.33.150:3001/"
            },
            "transactions": [{
                "item_list": {
                    "items": line_items
                },
                "amount": {
                    "currency": "USD",
                    "total": line_items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "PayPal payment creation failed" });
            } else {
                const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                return res.json({ url: approvalUrl });
            }
        });
        return;
    }


    let stripeTotal = 0;
    try {
        for (const product of products) {
            if (!product.productId || !product.qty) {
                return res.status(400).json({ error: "Invalid product format" });
            }

            const dbProduct = await getProductById(product.productId);
            stripeTotal += dbProduct.price * product.qty;

            const price = await stripe.prices.create({
                unit_amount: dbProduct.price * 100,
                currency: "usd",
                product_data: {
                    name: dbProduct.name,
                },
            });

            line_items.push({
                price: price.id,
                quantity: product.qty,
            });
        }
    } catch (error) {
        console.error("Error preparing line items:", error);
        return res.status(500).json({ error: error.message });
    }

    if(stripeTotal < process.env.MIN_PRICE_USD) {
        return res.status(400).json({ error: `Minimum order amount is $${process.env.MIN_PRICE_USD}` });
    }


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['EE', 'LV', 'LT'],
            },
            line_items,
            mode: 'payment',
            success_url: 'http://192.168.33.150:3001/afterPayment?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://192.168.33.150:3001',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
