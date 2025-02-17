// routes/challenges.js
const express = require('express');
const router = express.Router();
const challengeManager = require('../services/challengeManager');
const  auth  = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const User = require('../models/User')

// Obtenir la liste des challenges
router.get('/get-challenge-list', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find()
            .select('-vmConfig.flag') // Ne pas envoyer le flag au client
            .sort({ difficulty: 1 });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:challengeId', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.challengeId)
            .select('-vmConfig.flag'); // Ne pas envoyer le flag au client

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrer un challenge
router.post('/:challengeId/start', async (req, res) => {
    try {
        const { clientId } = req.body
        const instanceInfo = await challengeManager.startVPNConfig(
            clientId
            // req.params.challengeId
        );
        res.json(instanceInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrer un challenge
router.post('/:challengeId/startenv' , async (req, res) => {
    try {
        const { user } = req.body
        const instanceInfo = await challengeManager.startEnv(
            user,
            req.params.challengeId
        );
        res.json(instanceInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Arrêter un challenge
router.post('/instances/:instanceId/stop', auth, async (req, res) => {
    try {
        await challengeManager.stopChallenge(req.params.instanceId);
        res.json({ message: 'Challenge stopped successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtenir le statut d'une instance
router.get('/instances/:instanceId', auth, async (req, res) => {
    try {
        const status = await challengeManager.getChallengeStatus(req.params.instanceId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Soumettre un flag
router.post('/:challengeId/submit', auth, async (req, res) => {
    try {
        const  {flag, user}  = req.body;
        const challenge = await Challenge.findById(req.params.challengeId);
        
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
       
        const isCorrect = challenge.flag === flag;
        
         
        if (isCorrect) {
            // Mettre à jour le score de l'utilisateur
            await User.findByIdAndUpdate(
                // req.user.userId,
                user,
                {
                    $addToSet: { 'progress.completedChallenges': challenge._id },
                    $inc: { 'progress.points': challenge.points }
                }
            );
        }

        res.json({
            success: isCorrect,
            points: isCorrect ? challenge.points : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;