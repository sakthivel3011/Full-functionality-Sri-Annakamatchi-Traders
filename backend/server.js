// filepath: d:\HTML\Sri Annakamachi Traders\backend\server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for login password hashing

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
console.log('MONGO_URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// -------------------------------
// Login Schema and Routes
// -------------------------------
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Login API
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to MongoDB
        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save();

        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// -------------------------------
// Contact Schema and Routes
// -------------------------------
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
});

const Contact = mongoose.model('Contact', contactSchema);

// Contact Form API
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
// -------------------------------
// Start the Server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
