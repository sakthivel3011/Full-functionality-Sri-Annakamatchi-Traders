// filepath: d:\HTML\Sri Annakamachi Traders\backend\server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/contactFormDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define a schema for the contact form
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
});

const Contact = mongoose.model('Contact', contactSchema);

// API endpoint to handle form submissions
app.post('/submit-form', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Save the form data to MongoDB
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting form', error });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});