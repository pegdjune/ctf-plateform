#!/bin/bash

# Vérifier et créer les répertoires nécessaires
mkdir -p /var/run/apache2
mkdir -p /var/lock/apache2
mkdir -p /var/log/apache2
mkdir -p /var/log/supervisor

# Définir les permissions correctes
chown -R www-data:www-data /var/run/apache2
chown -R www-data:www-data /var/lock/apache2
chown -R www-data:www-data /var/log/apache2

# Démarrer Apache en premier plan
apache2ctl start

# Démarrer supervisord
/usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf