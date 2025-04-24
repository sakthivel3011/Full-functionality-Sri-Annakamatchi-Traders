const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Changed from bcrypt to bcryptjs
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sri_annakamachi_traders', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});

// MongoDB connection error handling
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// User schema and model
const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6 
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Input validation middleware
const validateSignupInput = (req, res, next) => {
    const { fullName, email, password } = req.body;
    
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    next();
};

// Sign-up route
app.post('/signup', validateSignupInput, async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Don't send back password hash
        const userResponse = {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            createdAt: newUser.createdAt
        };

        res.status(201).json({ 
            message: 'User registered successfully',
            user: userResponse
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login route
app.post('/login1', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Don't send back password hash
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email
        };

        res.status(200).json({ 
            message: 'Login successful',
            user: userResponse
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Sri Annakamachi Traders Backend is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});