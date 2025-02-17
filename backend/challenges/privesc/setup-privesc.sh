#!/bin/bash
# Script pour configurer l'environnement du challenge

# Compiler le service vulnérable
gcc -o /usr/local/bin/vulnerable-service vulnerable-service.c -fno-stack-protector -z execstack
chown root:root /usr/local/bin/vulnerable-service
chmod u+s /usr/local/bin/vulnerable-service

# Créer un utilisateur limité
useradd -m -s /bin/bash limited_user
echo "limited_user:password123" | chpasswd

# Configurer les permissions
chmod 755 /home/limited_user
chmod 644 /home/limited_user/.bashrc

# Ajouter des fausses pistes
echo "# Backup root password" > /root/.secret_backup
echo "root:HASH_REDACTED" >> /root/.secret_backup

# Créer des logs pour l'énumération
echo "[+] System update completed" >> /var/log/syslog
echo "[+] User 'admin' added to sudoers" >> /var/log/syslog
echo "[-] Failed su attempt from limited_user" >> /var/log/auth.log

# Note: Ce service est intentionnellement vulnérable pour le challenge