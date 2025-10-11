const mysql2 = require("mysql2");
require("dotenv").config();

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    typeCast: function (field, next) {
        if (field.type == "DECIMAL" || field.type == "NEWDECIMAL") {
            var value = field.string();
            return (value === null) ? null : Number(value);
        }
        return next();
    }
});

module.exports = pool;