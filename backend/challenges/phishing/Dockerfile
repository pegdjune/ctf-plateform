# challenges/phishing/Dockerfile
FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    apache2 \
    php \
    php-mysql \
    mysql-server \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Configuration du serveur web malveillant
COPY ./phishing-site /var/www/html/
COPY ./emails /root/evidence/emails/
COPY ./malware /root/malware/

# Configuration des logs et traces
RUN mkdir -p /var/log/maillog && \
    echo "phishing@evil.com -> victim@company.com [2024-01-15 10:23:15] Attachment: invoice.doc" > /var/log/maillog/mail.log

# Setup du flag
RUN echo "HTB{ph1sh1ng_4n4lys1s_c0mpl3t3}" > /root/flag.txt
RUN chmod 400 /root/flag.txt

EXPOSE 80 443
CMD ["apache2ctl", "-D", "FOREGROUND"]