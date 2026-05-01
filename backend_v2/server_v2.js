const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS - allow frontend
app.use(cors({
    origin: ['http://localhost:5173', 'https://team-task-manager-sigma-nine.vercel.app', 'https://team-task-manager-6e7h.onrender.com'],
    credentials: true
}));
app.use(express.json());

// Simple test endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Import all API routes
require('./routes_v2')(app);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});