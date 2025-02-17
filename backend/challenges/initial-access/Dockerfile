FROM ubuntu:22.04

# Éviter les prompts interactifs pendant l'installation
ENV DEBIAN_FRONTEND=noninteractive
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_PID_FILE /var/run/apache2/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_LOG_DIR /var/log/apache2

# Installation des dépendances
RUN apt-get update && apt-get install -y \
    curl \
    iproute2 \
    net-tools \
    iputils-ping \
    apache2 \
    php \
    php-mysql \
    mariadb-server \
    supervisor \
    libapache2-mod-php \
    && rm -rf /var/lib/apt/lists/*

# Configuration d'Apache
RUN a2enmod rewrite && \
    a2enmod mpm_prefork && \
    a2enmod php

RUN mkdir -p /var/run/apache2 \
    /var/lock/apache2 \
    /var/log/supervisor \
    /var/log/apache2

RUN mkdir -p /var/log/supervisor

# Copie des fichiers de l'application
COPY ./src/app/ /var/www/html/
COPY ./src/flag.txt /opt/flag.txt
COPY ./config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./config/apache2.conf /etc/apache2/sites-available/000-default.conf

# Configuration des permissions
RUN chown -R www-data:www-data /var/www/html/ \
    && chmod 644 /opt/flag.txt \
    && chown root:root /opt/flag.txt \
    && chown -R www-data:www-data /var/log/apache2 \
    && chown -R www-data:www-data /var/lock/apache2 \
    && chown -R www-data:www-data /var/run/apache2 \
    && chmod 755 /var/log/supervisor

# Nettoyage du répertoire web par défaut
RUN rm -f /var/www/html/index.html

# Test de la configuration Apache
RUN apache2ctl configtest

# Exposition du port web
EXPOSE 80

# Script de démarrage pour initialiser correctement les services
COPY ./start.sh /start.sh
RUN chmod +x /start.sh


# Vérification de la configuration
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1


# Démarrage des services
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
# Démarrage des services
CMD ["/start.sh"]