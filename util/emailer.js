const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "smtp73927@gmail.com",
        pass: process.env.SMTP_APP_PASSWORD
    }
});

async function sendEmail(to, title, content) {
    const info = await transporter.sendMail({
        from: '"Beer shop" <smtp73927@gmail.com>',
        to: to,
        subject: `[Beer shop] ${title}`,
        text: content, // plain‑text body
    });
    console.log("Email sent", info.messageId)
}

module.exports = {sendEmail};