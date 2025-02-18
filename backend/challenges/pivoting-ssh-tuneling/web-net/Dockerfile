# Choisir une version spécifique de l'Ubuntu pour homogénéiser les environnements
FROM ubuntu:20.04

# Éviter les prompts interactifs pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive

# Variables d'environnement pour Apache
ENV APACHE_RUN_USER=www-data
ENV APACHE_RUN_GROUP=www-data
ENV APACHE_PID_FILE=/var/run/apache2/apache2.pid
ENV APACHE_RUN_DIR=/var/run/apache2
ENV APACHE_LOCK_DIR=/var/lock/apache2
ENV APACHE_LOG_DIR=/var/log/apache2

# Installation des paquets requis
RUN apt-get update && apt-get install -y \
    apache2 \
    php \
    php-mysql \
    supervisor \
    libapache2-mod-php \
    mysql-client \
    mysql-server \
    nmap \
    curl \
    iproute2 \
    net-tools \
    iputils-ping \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Activer les modules Apache nécessaires
RUN a2enmod rewrite && a2enmod mpm_prefork 

# Créer le dossier de logs et ajouter des fichiers de test
RUN mkdir /var/www/html/logs 

COPY access.log /var/www/html/logs
COPY error.log  /var/www/html/logs

# Configurer le serveur SSH
RUN mkdir /var/run/sshd

# Définir un mot de passe pour le root à des fins de tests
RUN echo 'root:changeme' | chpasswd

# Préparer les répertoires nécessaires
RUN mkdir -p /root/.ssh /var/run/apache2 /var/lock/apache2 /var/log/supervisor /var/log/apache2

# Copier les fichiers de l'application
COPY index.php /var/www/html/
COPY ./src/flag.txt /opt/flag.txt
COPY ./config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./config/apache2.conf /etc/apache2/sites-available/000-default.conf
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Ajouter un fichier PHP avec des identifiants vulnérables
RUN echo "<?php\n\$db_user = 'root';\n\$db_pass = 'my-secret-pw';\n?>" > /var/www/html/db_config.php

# Générer une clé RSA et envoyer la clé publique dans /tmp (volume partagé)
RUN ssh-keygen -t rsa -b 2048 -f /root/.ssh/id_rsa -q -N "" && \
    chmod 600 /root/.ssh/id_rsa && \
    cp /root/.ssh/id_rsa.pub /tmp/id_rsa.pub

# Configuration d'un fichier HTML simple
#RUN echo "<h1>Web Server Active - Machine A</h1>" > /var/www/html/index.html

# Ajuster les permissions de fichiers
RUN chown -R www-data:www-data /var/www/html /var/run/apache2 /var/lock/apache2 /var/log/apache2 && \
    chmod 644 /opt/flag.txt && chown root:root /opt/flag.txt && \
    chmod 755 /var/log/supervisor



# Rendre /etc/passwd lisible
RUN chmod 644 /etc/passwd

# Nettoyer le répertoire web par défaut
RUN rm -f /var/www/html/index.html

# Test de la configuration Apache
RUN apache2ctl configtest

# Exposer le port HTTP
EXPOSE 80 22

# Vérification de la configuration
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1

# Démarrage des services
CMD ["/start.sh"]