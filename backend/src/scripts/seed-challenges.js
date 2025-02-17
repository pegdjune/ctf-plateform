// scripts/seed-challenges.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Challenge = require('../models/Challenge');
require('dotenv').config();

async function seedChallenges() {
    MONGODB_URI='mongodb://localhost:27017/ctf-platform'

    try {
        await mongoose.connect(MONGODB_URI , { useNewUrlParser: true, useUnifiedTopology: true })
    
        const challengesDir = path.join(__dirname, '../../challenges');
        const challenges = [];
    
        // Parcourir tous les dossiers de challenges
        const dirs = fs.readdirSync(challengesDir);
        for (const dir of dirs) {
            const challengePath = path.join(challengesDir, dir, 'challenge.json');
            if (fs.existsSync(challengePath)) {
                const challengeData = JSON.parse(fs.readFileSync(challengePath));
                challenges.push(challengeData);
            }
        }
    
        // Insérer dans MongoDB
        await Challenge.deleteMany({}); // Nettoyer d'abord
        await Challenge.insertMany(challenges);
    
        console.log(`${challenges.length} challenges seeded`);
        
    } catch (error) {
        console.error('Error seeding challenges:', error);
        process.exit(1);
    }

}

seedChallenges().catch(console.error);