require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const jwt = require('jsonwebtoken');
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(passport.initialize());

let invoices = [  // Move this outside to make it global
    { id: 101, amount: 100.00, dueDate: "2025-04-29", recipient: "Person A" },
    { id: 102, amount: 250.75, dueDate: "2025-04-22", recipient: "Person B" },
    { id: 103, amount: 500.25, dueDate: "2025-04-23", recipient: "Person C" },
    { id: 104, amount: 750.50, dueDate: "2025-04-21", recipient: "Person D" },
    { id: 105, amount: 300.00, dueDate: "2025-04-20", recipient: "Person E" },
];

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing!");
    process.exit(1);
}

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        if (!req.user) return res.status(401).json({ error: "Authentication failed" });

        const token = jwt.sign({
            id: req.user.id,
            name: req.user.displayName,
            email: req.user.emails[0].value,
            picture: req.user.photos[0].value
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.redirect(`http://localhost:3000/invoices?token=${token}`);
    });

app.get("/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json(decoded);
    } catch {
        res.status(403).json({ error: "Invalid token" });
    }
});

app.get('/invoices', (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const invoicesWithStatus = invoices.map(invoice => {
        const due = new Date(invoice.dueDate);
        due.setHours(0, 0, 0, 0);
        let status = "Upcoming";
        if (due < today) status = "Over Due";
        else if (due.getTime() === today.getTime()) status = "Due Today";
        return { ...invoice, status };
    });
    res.json(invoicesWithStatus);
});

app.post('/invoices', (req, res) => {
    const { recipient, amount, dueDate } = req.body;
    if (!recipient || !amount || !dueDate) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    const newInvoice = {
        id: invoices.length > 0 ? invoices[invoices.length - 1].id + 1 : 101,
        recipient,
        amount,
        dueDate
    };
    invoices.push(newInvoice);
    res.status(201).json({ success: true, invoice: newInvoice });
});

app.delete('/invoices/:id', (req, res) => {
    const invoiceId = parseInt(req.params.id);
    invoices = invoices.filter(inv => inv.id !== invoiceId);
    res.json({ success: true, message: `Invoice ${invoiceId} deleted` });
});

app.post("/send-invoice-reminder", (req, res) => {
    const { invoiceId, recipient, amount, dueDate, status } = req.body;
    if (!invoiceId || !recipient || !amount || !dueDate) {
        return res.status(400).json({ success: false, message: "Missing invoice details." });
    }

    const payload = { invoiceId, recipient, amount, dueDate, status };
    axios.post(process.env.ZAPIER_WEBHOOK_URL, payload, {
        headers: { "Content-Type": "application/json" }
    })
    .then(() => res.json({ success: true, message: "Reminder sent!" }))
    .catch(error => {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to send" });
    });
});

app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
