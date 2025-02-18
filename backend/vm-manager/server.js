// vm-manager/server.js
const express = require('express');
const Docker = require('dockerode');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();
const cors = require('cors');
const url = require('url')
const fs = require('fs').promises;
const { spawn } = require('child_process');
const util = require('util');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true  });
const docker = new Docker(); // Se connecte au daemon Docker local

// Middleware
app.use(express.json())
app.use(cors());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend's origin
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
//   });


// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected VM to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Modèle pour les instances de machines
const instanceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    challengeId: { type: String, required: true },
    containerId: { type: String },
    ipAddress: { type: String },
    ports: { type: Map, of: String }, // Map des ports exposés
    status: { 
        type: String, 
        enum: ['creating', 'running', 'stopped', 'error'],
        default: 'creating'
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

const Instance = mongoose.model('Instance', instanceSchema);

// Fonction utilitaire pour générer un nom de container unique
const generateContainerName = (userId, challengeId) => {
    return `ctf-${userId}-${challengeId}-${Date.now()}`.toLowerCase();
};

// Fonction pour nettoyer les anciennes instances
const cleanupExpiredInstances = async () => {
    const expiredInstances = await Instance.find({
        expiresAt: { $lt: new Date() },
        status: 'running'
    });

    for (const instance of expiredInstances) {
        try {
            const container = docker.getContainer(instance.containerId);
            await container.stop();
            await container.remove();
            instance.status = 'stopped';
            await instance.save();
        } catch (error) {
            console.error(`Erreur lors du nettoyage de l'instance ${instance.containerId}:`, error);
        }
    }
};


// -------------------------------------------------------------------------------------------------------- //


class VPNManager {
    constructor(caPassphrase , dockerContainerName='openvpn-server') {
        this.OVPN_DATA = "openvpn-data";
        this.caPassphrase = caPassphrase;
        this.containerName = dockerContainerName;
    }

    async generateClientCert(clientId) {
        return new Promise((resolve, reject) => {
            // Utiliser spawn au lieu de exec pour pouvoir interagir avec stdin
            const process = spawn('docker', [
                'exec' ,// 'run',
                // '-v', `${this.OVPN_DATA}:/etc/openvpn`,
                // '--rm',
                '-i',  // Mode interactif pour pouvoir envoyer le passphrase
                this.containerName, // 'kylemanna/openvpn',
                'easyrsa',
                'build-client-full',
                clientId,
                'nopass'
            ]);

            // Envoyer le passphrase quand demandé
            process.stderr.on('data', (data) => {
                const output = data.toString();
                console.log('stderr:', output   )
                if (output.includes('Enter pass phrase for')) {
                    process.stdin.write(`${this.caPassphrase}\n`);
                }
            });

            process.stdout.on('data', (data) => {
                console.log('stdout:', data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
        });
    }

    async getClientConfig(clientId) {
        return new Promise((resolve, reject) => {
            let config = '';
            const process = spawn('docker', [
                'exec',
                // '-v', `${this.OVPN_DATA}:/etc/openvpn`,
                // '--rm',
                this.containerName,
                'ovpn_getclient',
                clientId
            ]);

            process.stdout.on('data', (data) => {
                config += data.toString();
            });

            process.stderr.on('data', (data) => {
                console.error('stderr:', data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(config);
                } else {
                    reject(new Error(`Failed to get client config. Exit code: ${code}`));
                }
            });
        });
    }

    async revokeClientCert(clientId) {
        return new Promise((resolve, reject) => {
            const process = spawn('docker', [
                'exec',
                // '-v', `${this.OVPN_DATA}:/etc/openvpn`,
                // '--rm',
                '-i',
                this.containerName,
                'ovpn_revokeclient',
                clientId
            ]);

            process.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Enter pass phrase for')) {
                    process.stdin.write(`${this.caPassphrase}\n`);
                }
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    reject(new Error(`Failed to revoke client. Exit code: ${code}`));
                }
            });
        });
    }

    async listClients() {
        // Cette méthode ne nécessite pas de passphrase
        return new Promise((resolve, reject) => {
            let output = '';
            const process = spawn('docker', [
                'exec',
                // '-v', `${this.OVPN_DATA}:/etc/openvpn`,
                // '--rm',
                this.containerName,
                'ovpn_listclients'
            ]);

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output.split('\n').filter(line => line.trim()));
                } else {
                    reject(new Error(`Failed to list clients. Exit code: ${code}`));
                }
            });
        });
    }
}

// Initialiser avec le passphrase (à stocker de manière sécurisée en production)
const vpnManager = new VPNManager(process.env.CA_PASSPHRASE);

// Route pour générer une nouvelle configuration client
app.post('/vpn/generate', async (req, res) => {
    try {
        const { clientId } = req.body;
        console.log(req.body);
        if (!clientId) {
            return res.status(400).json({ error: 'clientId requis' });
        }

        // Vérifier l'existence du fichier de configuration dans le conteneur
        try {
            const checkFileExists = await new Promise((resolve, reject) => {
                const checkProcess = spawn('docker', [
                    'exec',
                    vpnManager.containerName,
                    'test', '-f', `/etc/openvpn/pki/issued/${clientId}.ovpn`
                ]);

                checkProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve(true); // Le fichier existe
                    } else {
                        resolve(false); // Le fichier n'existe pas
                    }
                });

                checkProcess.on('error', (err) => {
                    reject(err);
                });
            });

            if (checkFileExists) {
                // Si le fichier existe, récupérer le fichier de configuration
                const config = await vpnManager.getClientConfig(clientId);
                res.setHeader('Content-disposition', `attachment; filename=${clientId}.ovpn`);
                res.setHeader('Content-type', 'application/x-openvpn-profile');
                return res.send(config);
            }

            // Supprimer les fichiers existants à l'intérieur du conteneur
            await new Promise((resolve, reject) => {
                const removeProcess = spawn('docker', [
                    'exec',
                    vpnManager.containerName,
                    'bash', '-c',
                    `rm -f /etc/openvpn/pki/reqs/${clientId}.req /etc/openvpn/pki/private/${clientId}.key /etc/openvpn/pki/issued/${clientId}.crt`
                ]);

                removeProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error('Erreur lors de la suppression des fichiers existants'));
                    }
                });

                removeProcess.on('error', (err) => {
                    reject(err);
                });
            });

        } catch (err) {
            console.error('Erreur lors de la vérification du fichier de configuration:', err);
            return res.status(500).json({ error: 'Erreur lors de la vérification du fichier de configuration' });
        }



        await vpnManager.generateClientCert(clientId);
        const config = await vpnManager.getClientConfig(clientId);

        res.setHeader('Content-disposition', `attachment; filename=${clientId}.ovpn`);
        res.setHeader('Content-type', 'application/x-openvpn-profile');
        res.send(config);
    } catch (error) {
        console.error('Erreur génération config:', error);
        res.status(500).json({ error: error.message });
    }
});


// -----------------------------------------------------------------------------------------------------//

// Lancer le nettoyage toutes les 5 minutes
setInterval(cleanupExpiredInstances, 5 * 60 * 1000);

// Route pour créer une nouvelle instance
app.post('/api/instances', async (req, res) => {
    try {
        const { userId, challengeId, image, ports, image1, image2 } = req.body;
        
        // Vérifier si l'utilisateur a déjà une instance en cours
        const existingInstance = await Instance.findOne({
            userId,
            challengeId,
            status: 'running'
        });

        if (existingInstance) {
            return res.status(400).json({
                error: 'Une instance est déjà en cours pour ce challenge'
            });
        }

        const containerName = generateContainerName(userId, challengeId);
        const containerName1 = generateContainerName(userId + '1', challengeId);
        const containerName2 = generateContainerName(userId +'2', challengeId);
        const exposedPorts = {};
        const portBindings = {};

        // Configurer les ports à exposer
        ports.forEach(port => {
            exposedPorts[`${port}/tcp`] = {};
            portBindings[`${port}/tcp`] = [{ HostPort: '0' }]; // Port dynamique
        });

        // Créer le container
        const container = await docker.createContainer({
            Image: image,
            name: containerName,
            ExposedPorts: exposedPorts,
            HostConfig: {
                PortBindings: portBindings,
                Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                NanoCPUs: 1000000000, // 1 CPU
                SecurityOpt: ['no-new-privileges'],
                NetworkMode: 'bridge'
            },
             // S'assurer que le conteneur reste actif
            Tty: true,
            OpenStdin: true,
            StdinOnce: false
        });

        if(image1!=='' && image2!==''){

            const container1 = await docker.createContainer({
                Image: image1,
                name: containerName1,
                ExposedPorts: exposedPorts,
                HostConfig: {
                    PortBindings: portBindings,
                    Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                    NanoCPUs: 1000000000, // 1 CPU
                    SecurityOpt: ['no-new-privileges'],
                    NetworkMode: 'bridge'
                },
                 // S'assurer que le conteneur reste actif
                Tty: true,
                OpenStdin: true,
                StdinOnce: false
            });
    
            const container2 = await docker.createContainer({
                Image: image2,
                name: containerName2,
                ExposedPorts: exposedPorts,
                HostConfig: {
                    PortBindings: portBindings,
                    Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                    NanoCPUs: 1000000000, // 1 CPU
                    SecurityOpt: ['no-new-privileges'],
                    NetworkMode: 'bridge'
                },
                 // S'assurer que le conteneur reste actif
                Tty: true,
                OpenStdin: true,
                StdinOnce: false
            });

            await container1.start();
            await container2.start();
        }

        await container.start();

        // Récupérer les informations du container
        const containerInfo = await container.inspect();
        const networkSettings = containerInfo.NetworkSettings;
        const portMappings = new Map();

        // Récupérer les ports mappés
        Object.keys(networkSettings.Ports).forEach(port => {
            if (networkSettings.Ports[port] && networkSettings.Ports[port][0]) {
                portMappings.set(port.split('/')[0], networkSettings.Ports[port][0].HostPort);
            }
        });

        // Créer l'instance en base
        const instance = new Instance({
            userId,
            challengeId,
            containerId: container.id,
            ipAddress: networkSettings.IPAddress,
            ports: portMappings,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 heures
        });

        await instance.save();
        
        res.status(201).json({
            instanceId: instance._id,
            ports: Object.fromEntries(portMappings),
            ipAddress: networkSettings.IPAddress
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'instance:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'instance' });
    }
});

// --------------------------------------------------------------------------------------------------------------------- //


// Route pour créer l'environnement
app.post('/api/instances/create', async (req, res) => {
    try {
        const { userId, challengeId, image, ports, image1, image2 } = req.body;
        
        
    

        const containerName = generateContainerName(userId, challengeId);
        const containerName1 = generateContainerName(userId + '1', challengeId);
        const containerName2 = generateContainerName(userId +'2', challengeId);
        const exposedPorts = {};
        const portBindings = {
            '80/tcp': [{ HostPort: '8080' }],
            '22/tcp': [{ HostPort: '2222' }],
        };

        const portBindings1 = {
            '80/tcp': [{ HostPort: '8081' }],
            '22/tcp': [{ HostPort: '2223' }],
        };

        const portBindings2 = {
            '80/tcp': [{ HostPort: '8082' }],
            '22/tcp': [{ HostPort: '2224' }],
        };

        // Configurer les ports à exposer
        ports.forEach(port => {
            exposedPorts[`${port}/tcp`] = {};
            // portBindings[`${port}/tcp`] = [{ HostPort: '0' }]; // Port dynamique
        });

        const volume = await docker.createVolume({
            Name: 'shared_volume',
            Driver: 'local',
        });

        const networks = [
            { name: 'web_network', subnet: '172.20.0.0/24' },
            { name: 'db_network', subnet: '172.20.1.0/24' },
            { name: 'adminsys_network', subnet: '172.20.2.0/24' },
          ];
          
          // Créer les réseaux
          networks.forEach(({ name, subnet }) => {
            docker.createNetwork({
              Name: name,
              Driver: 'bridge',
              IPAM: {
                Config: [{ Subnet: subnet }],
              },
            }, (err, network) => {
              if (err) {
                console.error(`Erreur lors de la création du réseau ${name}:`, err);
              } else {
                console.log(`Réseau ${name} créé:`, network.id);
              }
            });
          });

        // Créer le container
        const container = await docker.createContainer({
            Image: image,
            name: containerName,
            ExposedPorts: exposedPorts,
            HostConfig: {
                PortBindings: portBindings,
                Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                NanoCPUs: 1000000000, // 1 CPU
                SecurityOpt: ['no-new-privileges'],
                NetworkMode: 'web_network',
                Binds: ['shared_volume:/tmp'], // Montage du volume dans /tmp
            },
             // S'assurer que le conteneur reste actif
            Tty: true,
            OpenStdin: true,
            StdinOnce: false,
            NetworkingConfig: {
                EndpointsConfig: {
                    'web_network': {
                        IPAddress: '172.20.0.2'  // IP fixe dans web_net
                    }
                }
            }
        });

        const container1 = await docker.createContainer({
            Image: image1,
            name: containerName1,
            ExposedPorts: exposedPorts,
            HostConfig: {
                PortBindings: portBindings1,
                Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                NanoCPUs: 1000000000, // 1 CPU
                SecurityOpt: ['no-new-privileges'],
                NetworkMode: 'db_network'
            },
                // S'assurer que le conteneur reste actif
            Tty: true,
            OpenStdin: true,
            StdinOnce: false,
            NetworkingConfig: {
                EndpointsConfig: {
                    'db_network': {
                        IPAddress: '172.20.1.2'  // IP fixe dans
                    }
                }
            }
        });

        const container2 = await docker.createContainer({
            Image: image2,
            name: containerName2,
            ExposedPorts: exposedPorts,
            HostConfig: {
                PortBindings: portBindings2,
                Memory: 512 * 1024 * 1024, // 512MB limite de mémoire
                NanoCPUs: 1000000000, // 1 CPU
                SecurityOpt: ['no-new-privileges'],
                NetworkMode: 'adminsys_network',
                Binds: ['shared_volume:/tmp'],
            },
                // S'assurer que le conteneur reste actif
            Tty: true,
            OpenStdin: true,
            StdinOnce: false,
            NetworkingConfig: {
                EndpointsConfig: {
                    'adminsys_network': {
                        IPAddress: '172.20.2.2'  // IP fixe dans
                    }
                }
            }
        });

        await container.start();
        await container1.start();
        await container2.start();


        // // Récupérer les informations du container
        // const containerInfo = await container.inspect();
        // const networkSettings = containerInfo.NetworkSettings;
        // const portMappings = new Map();

        // // Récupérer les ports mappés
        // Object.keys(networkSettings.Ports).forEach(port => {
        //     if (networkSettings.Ports[port] && networkSettings.Ports[port][0]) {
        //         portMappings.set(port.split('/')[0], networkSettings.Ports[port][0].HostPort);
        //     }
        // });


        // Connecter Machine  aux autres réseaux
        docker.getNetwork('db_network').connect({
            Container: container2.id,
            EndpointConfig: {
              IPAMConfig: {
                IPv4Address: '172.20.1.3',
              },
            },
          })
        
          docker.getNetwork('adminsys_network').connect({
            Container: container.id,
            EndpointConfig: {
              IPAMConfig: {
                IPv4Address: '172.20.2.3',
              },
            },
          })

        
        
        res.status(201).json({
           message: 'Environnement prêt'
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'environnement:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'environnement' });
    }
});

// Route pour arrêter une instance
app.post('/api/instances/:instanceId/stop', async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.instanceId);
        
        if (!instance) {
            return res.status(404).json({ error: 'Instance non trouvée' });
        }

        const container = docker.getContainer(instance.containerId);
        await container.stop();
        await container.remove();

        instance.status = 'stopped';
        await instance.save();

        res.json({ message: 'Instance arrêtée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'instance:', error);
        res.status(500).json({ error: 'Erreur lors de l\'arrêt de l\'instance' });
    }
});

// Route pour obtenir le statut d'une instance
app.get('/api/instances/:instanceId', async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.instanceId);
        
        if (!instance) {
            return res.status(404).json({ error: 'Instance non trouvée' });
        }

        res.json({
            status: instance.status,
            ports: Object.fromEntries(instance.ports),
            ipAddress: instance.ipAddress,
            expiresAt: instance.expiresAt
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
    }
});

// Route pour lister les instances d'un utilisateur
app.get('/api/instances/user/:userId', async (req, res) => {
    try {
        const instances = await Instance.find({ 
            userId: req.params.userId,
            status: 'running'
        });
        
        res.json(instances);
    } catch (error) {
        console.error('Erreur lors de la récupération des instances:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des instances' });
    }
});


// Gestion des connexions WebSocket pour le terminal
wss.on('connection', async (ws, req) => {
    console.log('WebSocket connection attempt received on URL:', req.url);
    const origin = req.headers.origin;
    console.log('Nouvelle connexion WebSocket depuis:', origin)

    try {
        // Extraire l'ID de l'instance de l'URL
        const instanceId = req.url.split('/terminal/')[1];
        if (!instanceId) {
            console.error('No instanceId in URL');
            ws.close();
            return;
        }
        console.log('Attempting to find instance:', instanceId);
        
        // Récupérer l'instance
        const instance = await Instance.findById(instanceId);
        if (!instance) {
            console.log('Instance introuvable !')
            ws.close();
            return;
        }

        // Récupérer le conteneur
        const container = docker.getContainer(instance.containerId);
        if (!container) {
            console.log('Conteneur introuvable !')
            ws.close();
            return;
        }

        const containerInfo = await container.inspect();
        if (!containerInfo.State.Running) {
            console.log('Conteneur arrêté. Tentative de démarrage...');
            await container.start();
            console.log('Conteneur démarré avec succès.');
        }else {
            console.log('Conteneur déjà en cours d exécution.');
        }
        
        // Attacher le stream au conteneur
        // const stream = await container.attach({
        //     stream: true,
        //     stdin: true,
        //     stdout: true,
        //     stderr: true,
        //     tty: true
        // });

        const exec = await container.exec({
            Cmd: ['/bin/bash'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            // User: 'user'
          });
      
          const stream = await exec.start({
            hijack: true,
            stdin: true,
            
          });

        // Gérer la communication bidirectionnelle
        stream.on('data', (chunk) => {
            const output = chunk.toString(); // Convertir le buffer en string
            console.log('Sortie reçue :', output); // Log dans le backend pour debug
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(output); // Envoyer au frontend via WebSocket
            }  
        });

        stream.on('error', (err) => {
            console.error('Erreur de flux Docker:', err.message);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(`Erreur: ${err.message}\n`); // Envoie l'erreur au client
            }
        });

        ws.on('message', (data) => {
            const command = data.toString('utf-8'); // Décoder en UTF-8
            console.log(`Commande reçue : ${command}`); // Log pour vérifier
            stream.write(command + '\n'); // Ajouter un retour chariot pour valider la commande
        
        });

        // Nettoyage à la fermeture
        ws.on('close', () => {
            stream.end();
        });

    } catch (error) {
        console.error('Terminal connection error:', error);
        ws.close();
    }
});

server.on('upgrade', (request, socket, head) =>{
    const pathname = url.parse(request.url).pathname;

    if(pathname.startsWith('/terminal/')){
        wss.handleUpgrade(request, socket, head, (ws)=>{
            wss.emit('connection', ws, request)
        });
    } else{
        socket.destroy()
    }
})

const PORT =  5002;
// app.listen(PORT, () => {
//     console.log(`VM Manager running on port ${PORT}`);
// });

server.listen(PORT , () => {
    console.log(`VM Manager (HTTP + WebSocket) running on port ${PORT }`);
});

module.exports = { app, server };