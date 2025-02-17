# Scénario : Silent Survivor
## Contexte
Un administrateur système a remarqué des connexions sortantes suspectes sur un serveur critique. Malgré plusieurs nettoyages et redémarrages, les connexions persistent. L'équipe soupçonne une compromission avancée avec plusieurs mécanismes de persistance.

## Mission
En tant qu'expert en forensique, vous devez :
1. Identifier tous les mécanismes de persistance
2. Analyser les modifications système
3. Comprendre la chronologie de l'attaque
4. Supprimer complètement la menace

## Ressources Disponibles
- Accès SSH au serveur
- Logs système
- Copie des tâches cron
- Liste des services systemd

## Éléments à Découvrir
- Backdoors cachés
- Tâches planifiées malveillantes
- Services compromis
- Scripts de démarrage modifiés

## MITRE ATT&CK
- Technique Principale : T1053.005 - Scheduled Task
- Techniques Associées :
  * T1053.003 - Cron
  * T1543.002 - Systemd Service