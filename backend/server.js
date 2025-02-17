// server.js - Point d'entrée principal
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
require('dotenv').config();

// Initialize express app
const app = express();

// Apply middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    // maxAge: 86400 // Cache préflight pendant 24 heures
  }));
app.use(express.json());


// Import routes
const challengeRoutes = require('./src/routes/challenges');
const authRoutes = require('./src/routes/route');

app.use('/api', authRoutes);
app.use('/api/challenges', challengeRoutes);





// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});