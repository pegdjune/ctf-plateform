// services/challengeManager.js
const axios = require('axios');
const Challenge = require('../models/Challenge');

class ChallengeManager {
    constructor() {
        this.vmManagerUrl = process.env.VM_MANAGER_API;
    }

    async startChallenge(userId, challengeId) {
        try {
            // Récupérer les infos du challenge
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Créer l'instance via le VM Manager
            const response = await axios.post(`${this.vmManagerUrl}/api/instances`, {
                userId,
                challengeId,
                image: challenge.vmConfig.image,
                ports: challenge.vmConfig.ports,
                image1: challenge.vmConfig.image1,
                image2: challenge.vmConfig.image2
            });

            return {
                instanceId: response.data.instanceId,
                ports: response.data.ports,
                ipAddress: response.data.ipAddress,
                challenge: {
                    title: challenge.title,
                    description: challenge.description,
                    mitreTechnique: challenge.mitreTechnique
                }
            };
        } catch (error) {
            console.error('Error starting challenge:', error);
            throw new Error('Failed to start challenge instance');
        }
    }

    async startVPNConfig(clientId) {

        try {

            const response = await axios.post(`${this.vmManagerUrl}/vpn/generate`, {
                clientId,
            }, {
                responseType: 'text'
            });

            return  response.data ;
            
        } catch (error) {
            console.error('Error starting VPN Config:', error);
            if (error.response) {
                throw new Error(`Failed to start VPN config: ${error.response.data?.error || error.message}`);
            }
            throw new Error('Failed to start VPN config: Network error');
    
        }
    }

    async startEnv(userId, challengeId) {
        try {
            // Récupérer les infos du challenge
            const challenge = await Challenge.findById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Créer l'instance via le VM Manager
            const response = await axios.post(`${this.vmManagerUrl}/api/instances/create`, {
                userId,
                challengeId,
                image: challenge.vmConfig.image,
                ports: challenge.vmConfig.ports,
                image1: challenge.vmConfig.image1,
                image2: challenge.vmConfig.image2
            });

            return {
                instanceId: response.data.instanceId,
                ports: response.data.ports,
                ipAddress: response.data.ipAddress,
                challenge: {
                    title: challenge.title,
                    description: challenge.description,
                    mitreTechnique: challenge.mitreTechnique
                }
            };
        } catch (error) {
            console.error('Error starting challenge:', error);
            throw new Error('Failed to start challenge instance');
        }
    }

    async stopChallenge(instanceId) {
        try {
            await axios.post(`${this.vmManagerUrl}/api/instances/${instanceId}/stop`);
            return true;
        } catch (error) {
            console.error('Error stopping challenge:', error);
            throw new Error('Failed to stop challenge instance');
        }
    }

    async getChallengeStatus(instanceId) {
        try {
            const response = await axios.get(`${this.vmManagerUrl}/api/instances/${instanceId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting challenge status:', error);
            throw new Error('Failed to get challenge status');
        }
    }
}

module.exports = new ChallengeManager();