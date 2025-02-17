docker.getNetwork(networkName).connect({
      Container: container.id,
      EndpointConfig: {
        IPAMConfig: {
          IPv4Address: staticIP,
        },
      },
    })


#####

const networks = [
  { name: 'web_network', subnet: '192.168.1.0/24' },
  { name: 'db_network', subnet: '192.168.2.0/24' },
  { name: 'adminsys_network', subnet: '192.168.3.0/24' },
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

####
docker.createNetwork({
  Name: 'web_network',
  Driver: 'bridge',
  IPAM: {
    Config: [
      {
        Subnet: '192.168.1.0/24',
      },
    ],
  },
}, (err, network) => {
  if (err) {
    console.error('Erreur lors de la création du réseau:', err);
  } else {
    console.log('Réseau créé:', network.id);
  }
});

######

const volume = await docker.createVolume({
      Name: 'shared_volume',
      Driver: 'local',
    });
    console.log('Volume créé :', volume.Name);

    // Étape 2: Lancer le premier conteneur
    const containerA = await docker.createContainer({
      Image: 'ubuntu', // Remplacez par l'image souhaitée
      name: 'container_a',
      Tty: true,
      HostConfig: {
        Binds: ['shared_volume:/tmp'], // Montage du volume dans /tmp
      },
      Cmd: ['/bin/bash'], // Garde le conteneur actif
    });