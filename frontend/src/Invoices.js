import React, { useEffect, useState } from "react";
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppBarComponent from "./AppBarComponent";

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [form, setForm] = useState({ recipient: "", amount: "", dueDate: "" });
    const navigate = useNavigate();

    const fetchInvoices = () => {
        fetch("http://localhost:5000/invoices", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => setInvoices(data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) {
            localStorage.setItem("token", token);
            window.history.replaceState({}, "", window.location.pathname);
        }

        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            console.error("No token. Redirecting.");
            navigate("/");
            return;
        }

        fetch("http://localhost:5000/me", {
            headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then(res => res.json())
        .then(user => localStorage.setItem("user", JSON.stringify(user)))
        .catch(() => navigate("/"));

        fetchInvoices();
    }, [navigate]);

    const handleSendReminder = (id, recipient, amount, dueDate, status) => {
        fetch("http://localhost:5000/send-invoice-reminder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ invoiceId: id, recipient, amount, dueDate, status })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.success ? `Reminder sent for Invoice #${id}` : "Failed to send reminder");
        });
    };

    const handleAddInvoice = () => {
        fetch("http://localhost:5000/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(form)
        })
        .then(res => res.json())
        .then(() => {
            setForm({ recipient: "", amount: "", dueDate: "" });
            fetchInvoices();
        });
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5000/invoices/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(() => fetchInvoices());
    };

    return (
        <>
            <AppBarComponent />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box mb={2} display="flex" gap={2}>
                    <TextField label="Recipient" value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} />
                    <TextField label="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    <TextField label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                    <Button variant="contained" onClick={handleAddInvoice}>Add Invoice</Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Invoice ID</strong></TableCell>
                                <TableCell><strong>Recipient</strong></TableCell>
                                <TableCell><strong>Amount</strong></TableCell>
                                <TableCell><strong>Due Date</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.id}</TableCell>
                                    <TableCell>{inv.recipient}</TableCell>
                                    <TableCell>{inv.amount}</TableCell>
                                    <TableCell>{inv.dueDate}</TableCell>
                                    <TableCell sx={{ color: "red"}}>{inv.status}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" size="small" onClick={() => handleSendReminder(inv.id, inv.recipient, inv.amount, inv.dueDate, inv.status)}>Send</Button>{" "}
                                        <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(inv.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
};

export default Invoices;
