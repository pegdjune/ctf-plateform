# Scénario : Operation Invoice Trap
## Contexte
Vous êtes un analyste SOC pour MegaCorp. Le département financier a signalé des activités suspectes sur les comptes de l'entreprise. Une investigation préliminaire suggère qu'un employé a reçu un email concernant une facture et depuis, des mouvements bancaires inhabituels ont été détectés.

## Mission
En tant qu'analyste, vous devez :
1. Analyser l'infrastructure de phishing découverte
2. Récupérer les logs de connexion des victimes
3. Identifier le malware utilisé dans l'attaque
4. Trouver les preuves d'exfiltration de données

## Ressources Disponibles
- Serveur web de phishing capturé
- Logs d'email
- Échantillon du malware
- Logs réseau

## Indicateurs de Compromission (IoC) à trouver
- Domaine de phishing
- Hash du document malveillant
- IP du serveur C2
- Credentials volés

## MITRE ATT&CK
- Technique Principale : T1566 - Phishing
- Sous-techniques :
  * T1566.001 - Spearphishing Attachment
  * T1566.002 - Spearphishing Link