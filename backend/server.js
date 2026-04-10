const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
connectDB();

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Satech API' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/news', newsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
