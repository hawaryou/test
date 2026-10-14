# Inventaire matériel EuroMed

Application mobile hébergée sur GitHub Pages pour inventorier en série le matériel médical, sans Google Forms.

## Fonctionnement

- Scanner les numéros de série des équipements : EAN-13, Code 128, QR Code et Data Matrix selon le mode de scan.
- Le foyer et le nom sont communs à l'inventaire ; chaque chambre est ajoutée séparément.
- Le numéro de série du lit est obligatoire. Potence, barrière et matelas à air sont facultatifs.
- Les chambres sont conservées localement dans le navigateur pendant la saisie.
- À la fin, l'application génère un PDF global du foyer, le télécharge sur l'appareil et l'envoie à `maintenance@euromed-materiel-medical.com` via Microsoft 365.
- Le bouton Menu EuroMed reste présent et est masqué à l'impression.

## Publication

1. Décompresser le projet.
2. Déposer les fichiers du dossier `inventaire-materiel-main` dans le dépôt GitHub Pages.
3. Activer GitHub Pages dans les paramètres du dépôt si ce n'est pas déjà fait.
4. Configurer Microsoft 365 en suivant [`CONFIGURATION-MICROSOFT.md`](CONFIGURATION-MICROSOFT.md).

## Protection des données

L'application affiche une notice de confidentialité, limite les données aux informations utiles à l'inventaire, conserve les fiches en local sur l'appareil pendant la saisie, permet l'effacement manuel et efface les données de travail locales après un envoi confirmé. Le PDF téléchargé et le courriel envoyé restent à gérer selon la politique de conservation d'EuroMed. Ces mesures ne suffisent pas, à elles seules, à garantir la conformité RGPD : la base légale, les durées de conservation, les responsabilités, les sous-traitants et les droits des personnes doivent être validés par EuroMed avant déploiement.

## Important

La connexion Microsoft 365 doit être configurée avant que l'envoi automatique fonctionne. Sans cette configuration, l'application ne peut pas envoyer le PDF ; elle affiche une erreur explicite et le PDF peut être téléchargé si sa génération a réussi. Les données de saisie restent sur le navigateur de l'appareil, sans synchronisation centrale.
