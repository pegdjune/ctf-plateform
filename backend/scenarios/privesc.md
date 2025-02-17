# Scénario : Kernel Chaos
## Contexte
Une entreprise utilise un ancien serveur Linux qui ne peut pas être mis à jour pour des raisons de compatibilité. Les auditeurs de sécurité ont alerté sur des vulnérabilités critiques, mais la direction a ignoré les avertissements. Un incident s'est produit.

## Mission
En tant qu'expert en test d'intrusion, vous devez :
1. Identifier les vulnérabilités du système
2. Exploiter les faiblesses pour obtenir les privilèges root
3. Documenter le chemin d'exploitation
4. Proposer des mesures d'atténuation

## Ressources Disponibles
- Accès SSH avec utilisateur limité
- Version du kernel connue
- Binaires SUID disponibles
- Logs système

## Vulnérabilités à Exploiter
- Kernel exploit
- Buffer overflow
- Misconfiguration des permissions
- SUID binary vulnerability

## MITRE ATT&CK
- Technique Principale : T1068 - Exploitation for Privilege Escalation
- Techniques Associées :
  * T1548.001 - Setuid and Setgid
  * T1574.006 - Dynamic Linker Hijacking