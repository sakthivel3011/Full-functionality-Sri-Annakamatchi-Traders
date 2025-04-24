const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

require('dotenv').config(); // Optional for using .env

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sriAnnakamachiDB';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB once
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ======= LOGIN ROUTES =======
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const validateSignupInput = (req, res, next) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    next();
};

app.post('/signup', validateSignupInput, async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: { _id: newUser._id, fullName, email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/login1', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });

        res.status(200).json({ message: 'Login successful', user: { _id: user._id, fullName: user.fullName, email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ======= CONTACT FORM ROUTE =======
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String,
});
const Contact = mongoose.model('Contact', contactSchema);

app.post('/submit-form', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting form', error });
    }
});

// ======= PAYMENT ROUTE =======
const orderSchema = new mongoose.Schema({
    id: String,
    date: String,
    items: Array,
    customer: Object,
    paymentMethod: String,
    subtotal: Number,
    tax: Number,
    delivery: Number,
    total: Number
});
const Order = mongoose.model('Order', orderSchema);

app.post('/submit-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(200).json({ message: 'Order saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save order' });
    }
});

// ======= BASE ROUTE =======
app.get('/', (req, res) => {
    res.send('✅ Sri Annakamachi Traders Main Server Running');
});

// ======= START SERVER =======
app.listen(PORT, () => {
    console.log(`🚀 All services running on http://localhost:${PORT}`);
});
