# challenges/persistence/Dockerfile
FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    cron \
    netcat \
    python3 \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur standard
RUN useradd -m -s /bin/bash ctfuser && \
    echo "ctfuser:password123" | chpasswd && \
    adduser ctfuser sudo

# Mettre en place la tâche planifiée malveillante
RUN (crontab -l 2>/dev/null; echo "*/5 * * * * /home/ctfuser/.hidden/backdoor") | crontab -

# Configurer le backdoor
COPY ./backdoor /home/ctfuser/.hidden/
RUN chmod +x /home/ctfuser/.hidden/backdoor && \
    chown -R root:root /home/ctfuser/.hidden

# Setup du flag
RUN echo "HTB{sch3dul3d_t4sk_1d3nt1f13d}" > /root/flag.txt && \
    chmod 400 /root/flag.txt

EXPOSE 3389
CMD ["/usr/sbin/cron", "-f"]