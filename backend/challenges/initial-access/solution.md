# Initial Access Challenge - Solution Guide

## Description du Challenge
Ce challenge simule une application web vulnérable à une attaque de type Local File Inclusion (LFI). L'objectif est d'exploiter cette vulnérabilité pour lire le fichier flag.txt situé dans /opt/flag.txt.

**MITRE ATT&CK Technique**: T1190 - Exploit Public-Facing Application

## Étapes de Résolution

1. **Reconnaissance initiale**
   - Accéder à l'application web sur le port 80
   - Observer le formulaire de visualisation de documents
   - Tester les entrées basiques pour comprendre le comportement

2. **Identification de la vulnérabilité**
   - L'application accepte un paramètre 'file' en POST
   - Aucune validation ou sanitization n'est effectuée sur l'input
   - La fonction include() de PHP est utilisée directement avec l'input utilisateur

3. **Exploitation**
   ```bash
   # Méthode 1 - Via le formulaire web
   Entrer dans le champ : ../../../../opt/flag.txt

   # Méthode 2 - Via curl
   curl -X POST http://target-ip/index.php \
        -d "file=../../../../opt/flag.txt&submit=View"
   ```

4. **Extraction du flag**
   - Le contenu du fichier flag.txt sera affiché dans la réponse
   - Le flag suit le format : FLAG{XXXX-XXXX-XXXX-XXXX}

## Indicateurs de Réussite
- Accès réussi au fichier flag.txt
- Affichage du contenu du flag
- Pas d'erreurs PHP dans la réponse

## Points Bonus
- Trouver d'autres fichiers sensibles (/etc/passwd, logs Apache)
- Exploiter la LFI pour obtenir RCE via wrapper PHP
- Documenter d'autres vecteurs d'exploitation possibles

## Remédiation
Pour sécuriser l'application, il faudrait :
1. Valider et sanitizer les entrées utilisateur
2. Utiliser une liste blanche de fichiers autorisés
3. Désactiver les wrappers PHP dangereux
4. Implémenter un contrôle d'accès strict