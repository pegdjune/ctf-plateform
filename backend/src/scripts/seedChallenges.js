// scripts/seedChallenges.js
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
require('dotenv').config();

const challenges = [
    {
        title: "Initial Access via Phishing",
        description: `Dans ce challenge, vous devez analyser une infrastructure compromise par phishing.
                     Objectifs:
                     1. Trouver le point d'entrée initial
                     2. Analyser le malware utilisé
                     3. Identifier les données exfiltrées`,
        difficulty: "medium",
        points: 300,
        category: "Initial Access",
        mitreTechnique: {
            techniqueID: "T1566",
            tacticID: "TA0001",
            name: "Phishing"
        },
        vmConfig: {
            image: "ctf/phishing-challenge:latest",
            ports: [80, 443],
            flag: "HTB{ph1sh1ng_4n4lys1s_c0mpl3t3}"
        }
    },
    {
        title: "Persistence via Scheduled Task",
        description: `Un attaquant a établi une persistance sur le système.
                     Objectifs:
                     1. Identifier la tâche planifiée malveillante
                     2. Analyser le mécanisme de persistance
                     3. Supprimer la persistance et trouver le flag`,
        difficulty: "hard",
        points: 400,
        category: "Persistence",
        mitreTechnique: {
            techniqueID: "T1053.005",
            tacticID: "TA0003",
            name: "Scheduled Task/Job: Scheduled Task"
        },
        vmConfig: {
            image: "ctf/persistence-challenge:latest",
            ports: [3389],
            flag: "HTB{sch3dul3d_t4sk_1d3nt1f13d}"
        }
    },
    {
        title: "Privilege Escalation via Kernel Exploit",
        description: `Une machine vulnérable nécessite une élévation de privilèges.
                     Objectifs:
                     1. Identifier la version du kernel vulnérable
                     2. Exploiter la vulnérabilité
                     3. Obtenir les privilèges root`,
        difficulty: "hard",
        points: 500,
        category: "Privilege Escalation",
        mitreTechnique: {
            techniqueID: "T1068",
            tacticID: "TA0004",
            name: "Exploitation for Privilege Escalation"
        },
        vmConfig: {
            image: "ctf/privesc-challenge:latest",
            ports: [22],
            flag: "HTB{k3rn3l_3xpl01t_m4st3r}"
        }
    }
];

async function seedChallenges() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Nettoyer la collection existante
        await Challenge.deleteMany({});
        
        // Insérer les nouveaux challenges
        const result = await Challenge.insertMany(challenges);
        console.log(`${result.length} challenges have been seeded`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding challenges:', error);
        process.exit(1);
    }
}

seedChallenges();