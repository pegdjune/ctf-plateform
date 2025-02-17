
const mongoose = require('mongoose');

const networkSchema = new mongoose.Schema({
    name: String,
    description: String
});

const authorizedFlowSchema = new mongoose.Schema({
    from: String,
    to: String,
    protocol: String,
    port: Number
});

const mitreTechniqueSchema = new mongoose.Schema({
    techniqueID: String,
    tacticID: String,
    name: String
});

const phaseSchema = new mongoose.Schema({
    phase: Number,
    name: String,
    description: String,
    actions: [String],
    mitreTechniques: [mitreTechniqueSchema]
});

const detectionMeasureSchema = new mongoose.Schema({
    category: String,
    measures: [String]
});

const scenarioSchema = new mongoose.Schema({
    context: {
        networks: [networkSchema],
        authorizedFlows: [authorizedFlowSchema]
    },
    phases: [phaseSchema],
    detectionMeasures: [detectionMeasureSchema]
});


const challengeSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    category: {
        type: String,
        enum: ['offensive', 'defensive']
    },
    points: Number,
    flag: {
        type: String,
        select: true  // Le flag n'est pas envoyé par défaut
    },
    mitreTechnique: {
        techniqueID: String,
        tacticID: String,
        name: String
    },
    vmConfig: {
        image: String,
        image1: String,
        image2: String,
        ports: [Number]
    },
    scenario: scenarioSchema
});

module.exports = mongoose.model('Challenge', challengeSchema);

// Define Challenge schema with CTF challenge properties
// const challengeSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
//     points: { type: Number, required: true },
//     category: { type: String, required: true },
//     mitreTechnique: {
//         techniqueID: String,
//         tacticID: String,
//         name: String
//     },
//     vmConfig: {
//         image: String,
//         ports: [Number],
//         flag: String
//     }
// });

// const Challenge = mongoose.model('Challenge', challengeSchema); 
// module.exports = Challenge;