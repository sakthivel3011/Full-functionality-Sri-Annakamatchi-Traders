
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/paymentdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define schema and model
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

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Handle order submission
app.post('/submit-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(200).json({ message: 'Order saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save order' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
