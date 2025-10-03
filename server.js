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

app.get("/fetchProducts", require("./endpoints/product/fetchProducts.js"));
app.get("/fetchProduct/:id", require("./endpoints/product/fetchProduct.js"));
app.post("/purchaseProduct", require("./endpoints/product/purchaseProduct.js"));
app.delete("/deleteProduct/:id", require("./endpoints/product/deleteProduct.js"));
app.put("/updateProduct/:id", require("./endpoints/product/updateProduct.js"));
app.post("/addProduct", require("./endpoints/product/addProduct.js"));

app.get("/afterPayment", require("./endpoints/afterPayment.js"));
app.get("/fetchOrders", require("./endpoints/order/fetchOrders.js"));
app.post("/completeOrder", require("./endpoints/order/completeOrder.js"));
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