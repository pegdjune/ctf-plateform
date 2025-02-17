FROM ubuntu:22.04

# Installation des paquets nécessaires
RUN apt-get update && apt-get install -y \
    openssh-server \
    python3 \
    sudo \
    cron \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Création des utilisateurs
RUN useradd -m -s /bin/bash user && \
    echo "user:password123" | chpasswd && \
    useradd -m -s /bin/bash admin && \
    echo "admin:strongpass456" | chpasswd

# Configuration SSH
RUN mkdir /var/run/sshd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# Setup des fichiers et permissions
COPY files/check_backup /usr/local/bin/
COPY files/backup_script.sh /usr/local/bin/
COPY files/monitor.sh /home/admin/
COPY files/.backup_config /home/admin/

RUN chown root:root /usr/local/bin/check_backup && \
    chmod 4755 /usr/local/bin/check_backup && \
    chown admin:admin /home/admin/monitor.sh && \
    chmod 700 /home/admin/monitor.sh && \
    chown admin:admin /home/admin/.backup_config && \
    chmod 600 /home/admin/.backup_config

# Configuration cron pour admin
RUN echo "*/5 * * * * /home/admin/monitor.sh" >> /var/spool/cron/crontabs/admin

EXPOSE 22

# Création du flag
RUN echo "FLAG{M1TR3_4TT4CK_PR1V_3SC_2024}" > /root/flag.txt && \
    chmod 600 /root/flag.txt

CMD ["/usr/sbin/sshd", "-D"]