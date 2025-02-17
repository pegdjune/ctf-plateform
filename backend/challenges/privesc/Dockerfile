# challenges/privesc/Dockerfile
FROM ubuntu:16.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openssh-server \
    python3 \
    sudo \
    gcc \
    make \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur standard
RUN useradd -m -s /bin/bash ctfuser && \
    echo "ctfuser:password123" | chpasswd

# Configuration SSH
RUN mkdir /var/run/sshd && \
    echo 'PermitRootLogin no' >> /etc/ssh/sshd_config && \
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config

# Installer un kernel vulnérable spécifique
COPY ./vulnerable-kernel.deb /tmp/
RUN dpkg -i /tmp/vulnerable-kernel.deb

# Setup du flag
RUN echo "HTB{k3rn3l_3xpl01t_m4st3r}" > /root/flag.txt && \
    chmod 400 /root/flag.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]