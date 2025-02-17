# Solution : Silent Survivor

## Étape 1 : Énumération des Tâches Planifiées
```bash
# Vérifier les tâches cron
crontab -l
ls -la /etc/cron*

# Examiner les services
systemctl list-units --all
find /etc/systemd/system -type f
```

## Étape 2 : Analyse des Fichiers Cachés
```bash
# Chercher les fichiers cachés
find / -name ".*" -type f 2>/dev/null
ls -la /home/ctfuser/.hidden/

# Analyser le backdoor
cat /home/ctfuser/.hidden/backdoor
```

## Étape 3 : Nettoyage
```bash
# Supprimer les tâches malveillantes
crontab -r
systemctl stop .hidden-service
systemctl disable .hidden-service

# Nettoyer .bashrc
sed -i '/backdoor/d' /home/ctfuser/.bashrc
```

## Flag
Le flag est révélé après avoir supprimé tous les mécanismes de persistance.