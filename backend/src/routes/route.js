const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');


router.get('/verify-token', auth, (req, res) => {
    // Si le middleware `auth` passe le contrôle ici, cela signifie que le token est valide
    res.status(200).json({ valid: true, message: 'Token is valid' });
});


// Handle user registration
router.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Handle user login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



// Get all challenges (protected route)
router.get('/challenges', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find();
        res.json(challenges);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Submit challenge flag and update user progress
router.post('/challenges/submit', auth, async (req, res) => {
    try {
        const { challengeId, flag } = req.body;
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (challenge.vmConfig.flag === flag) {
            const user = await User.findById(req.user.userId);
            if (!user.progress.completedChallenges.includes(challengeId)) {
                user.progress.completedChallenges.push(challengeId);
                user.progress.points += challenge.points;
                await user.save();
            }
            res.json({ success: true, points: challenge.points });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 