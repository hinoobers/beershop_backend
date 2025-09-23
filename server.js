const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");

const pool = require("./database.js");

app.use(express.json());
app.use(express.static("frontend"));
app.use((req, res, next) => {
    // Get cookie
    let sessionId = req.headers["x-session-id"];
    if (!sessionId) {
        sessionId = uuidv4();
    }
    req.cookies = { session: sessionId };
    next();
});

app.get("/fetchProducts", require("./endpoints/fetchProducts.js"));
app.post("/purchaseProduct", require("./endpoints/purchaseProduct.js"));
app.get("/afterPayment", require("./endpoints/afterPayment.js"));
app.get("/fetchOrders", require("./endpoints/fetchOrders.js"));
app.post("/completeOrder", require("./endpoints/completeOrder.js"));
app.post("/login", require("./endpoints/login.js").login);

app.get("/testsession", (req, res) => {
    res.json({ sessionId: req.cookies.session });
});

app.listen(3000, () => {
    console.log("Bäckend jookseb pordi 3000 peal!")
    pool.query("SELECT * FROM products", (error, results) => {
        if (error) {
            console.error("Viga päringu täitmisel:", error);
            return;
        }
        console.log("Tooted:", results);
    });
})