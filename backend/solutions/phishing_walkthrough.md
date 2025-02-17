# Solution : Operation Invoice Trap

## Étape 1 : Reconnaissance
```bash
# Scanner le serveur web
nmap -sV -p- target_ip

# Examiner le site de phishing
curl http://target_ip/
```

## Étape 2 : Analyse des Logs
```bash
# Accéder aux logs
cat /var/log/phishing/access.log
cat /var/log/maillog/mail.log

# Extraire les credentials
grep -r "Username:" /var/log/phishing/
```

## Étape 3 : Analyse du Malware
```bash
# Localiser le malware
find /root/malware -type f

# Analyser le script Python
cat /root/malware/backdoor.py

# Identifier le C2
grep -r "attacker.evil.com" /root/malware/
```

## Flag
Le flag se trouve dans /root/flag.txt après avoir complété l'analyse complète.