# Checklist RGPD avant mise en production — EuroMed Inventaire

Cette checklist est un support opérationnel, pas un avis juridique ni une certification de conformité.

## À valider par EuroMed

- [ ] Identifier officiellement le responsable du traitement et un contact confidentialité/DPO, s'il y en a un.
- [ ] Définir la finalité précise et la base légale du traitement ; documenter pourquoi le champ « Nom » est nécessaire et le supprimer ou le remplacer par une référence si possible.
- [ ] Déterminer les personnes concernées par le champ « Nom » et leur fournir l'information requise avant la collecte.
- [ ] Fixer des durées de conservation justifiées pour les PDF téléchargés, les courriels envoyés, les pièces jointes et les sauvegardes ; définir qui les supprime.
- [ ] Vérifier les conditions contractuelles et de traitement des données de Microsoft 365, GitHub Pages et des CDN utilisés (jsDelivr et Microsoft), ainsi que les éventuels transferts hors EEE.
- [ ] Valider avec l'administrateur Microsoft les autorisations Entra ID minimales et la politique d'accès à la boîte `maintenance@euromed-materiel-medical.com`.
- [ ] Définir les personnes autorisées à accéder à la boîte aux lettres, aux PDF et aux appareils utilisés pour l'inventaire.
- [ ] Définir une procédure de perte/vol d'appareil, d'envoi à un mauvais destinataire et de violation de données.
- [ ] Vérifier si le traitement doit être inscrit au registre des traitements et si une analyse d'impact est nécessaire compte tenu du contexte réel.
- [ ] Tester l'effacement local, la gestion des erreurs d'envoi, l'accès par compte Microsoft autorisé et la procédure de suppression des PDF et courriels.
- [ ] Vérifier la notice de confidentialité et les droits d'accès, de rectification, d'effacement et de limitation applicables.

## Mesures techniques déjà prévues dans le projet

- Pas de Google Forms.
- Pas d'outil d'analyse d'audience ajouté par le projet.
- Inventaire de travail stocké localement dans le navigateur pendant la saisie.
- Bouton d'effacement manuel des données locales.
- Effacement des données de travail locales après acceptation de l'envoi par Microsoft Graph.
- Pas de mot de passe ni de secret client Microsoft dans le dépôt GitHub public.
- Envoi au destinataire fixe `maintenance@euromed-materiel-medical.com` et connexion attendue à ce compte.

## Limites à comprendre

GitHub Pages est un hébergement public de fichiers statiques. Les bibliothèques JavaScript sont chargées depuis des CDN tiers, qui peuvent recevoir des informations techniques de connexion (par exemple l'adresse IP et des métadonnées de requête). Le stockage local du navigateur n'est pas chiffré par cette application et n'est pas synchronisé. L'effacement local ne supprime pas les PDF téléchargés, les courriels envoyés, les éléments de corbeille ou les sauvegardes. La conformité dépend aussi des pratiques et paramètres d'EuroMed, des contrats fournisseurs et du contexte d'utilisation.
