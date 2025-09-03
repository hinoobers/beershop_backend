const express = require("express");
const app = express();

const pool = require("./database.js");


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