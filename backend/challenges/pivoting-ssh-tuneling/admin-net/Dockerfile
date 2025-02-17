# Dockerfile for Admin System
FROM ubuntu:latest

# Installer SSH
RUN apt-get update && apt-get install -y openssh-server \
    mysql-client \
    iproute2 \
    net-tools \
    iputils-ping \
    && apt-get clean
RUN mkdir /var/run/sshd

# Ajouter un utilisateur avec un mot de passe
RUN useradd -m adminuser && echo "adminuser:passwordz" | chpasswd

# Créer le répertoire SSH pour l'utilisateur et configurer les autorisations
RUN mkdir -p /home/adminuser/.ssh && chmod 700 /home/adminuser/.ssh

# Copier la clé publique depuis /tmp vers authorized_keys pendant la construction
RUN if [ -f /tmp/id_rsa.pub ]; then \
        cat /tmp/id_rsa.pub >> ~/.ssh/authorized_keys; \
        chmod 600 /home/adminuser/.ssh/authorized_keys; \
        chown adminuser:adminuser /home/adminuser/; \
    fi
 
# Exposer le port SSH
EXPOSE 22

# Lancer SSH au démarrage
CMD ["/usr/sbin/sshd", "-D"]