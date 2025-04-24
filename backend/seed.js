const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sri_annakamachi_traders', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// User schema and model
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Sign-up route
app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error during sign-up:', err);
        res.status(500).send('Server error');
    }
});

// Seed a test user
async function seedUser() {
    const email = 'test@example.com';
    const password = 'password123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });

    try {
        await user.save();
        console.log('Test user created successfully');
    } catch (err) {
        console.error('Error creating test user:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedUser();

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Invalid password for email: ${email}`);
            return res.status(401).send('Invalid credentials');
        }

        res.status(200).send('Login successful');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});