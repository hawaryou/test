# Configuration de l'envoi automatique par Microsoft 365

L'application reste hébergée sur GitHub Pages. Elle génère le PDF dans le navigateur et utilise Microsoft Graph avec une connexion Microsoft 365 (authentification déléguée). Aucun mot de passe ni secret client n'est stocké dans le dépôt public.

## Avant de commencer

- Le compte `maintenance@euromed-materiel-medical.com` doit être un compte Microsoft 365 professionnel disposant d'une boîte aux lettres Exchange Online.
- Il faut pouvoir enregistrer une application dans Microsoft Entra ID. Selon la configuration de l'organisation, l'administrateur Microsoft 365 devra approuver les autorisations.
- Déployer d'abord le projet sur GitHub Pages en HTTPS. L'adresse de redirection doit être exactement l'URL publique de l'application.

## 1. Enregistrer l'application Microsoft

1. Ouvrir le centre d'administration Microsoft Entra : https://entra.microsoft.com/.
2. Aller dans **Identité > Applications > Inscriptions d'applications > Nouvelle inscription**.
3. Nom conseillé : `EuroMed Inventaire GitHub Pages`.
4. Choisir **Comptes dans cet annuaire organisationnel uniquement**.
5. Dans **URI de redirection**, choisir **Application monopage (SPA)** et saisir l'URL publique exacte de l'application, par exemple `https://hawaryou.github.io/inventaire-materiel/`. Adapter cette URL si le dépôt ou l'adresse GitHub Pages est différent.
6. Cliquer sur **Inscrire**.
7. Copier l'**ID d'application (client)** et l'**ID de l'annuaire (locataire/tenant)**.

## 2. Autoriser l'envoi de courrier

1. Dans l'inscription d'application, ouvrir **Autorisations API** > **Ajouter une autorisation** > **Microsoft Graph** > **Autorisations déléguées**.
2. Ajouter `User.Read` et `Mail.Send`.
3. Si l'organisation le demande, faire cliquer l'administrateur sur **Accorder le consentement de l'administrateur**.
4. Ne pas créer de secret client : une application monopage ne doit pas contenir de secret.

## 3. Renseigner les identifiants dans le site

Dans `index.html`, chercher ces deux lignes au début du script principal :

```js
const MS_TENANT_ID = "REMPLACER_PAR_ID_TENANT_MICROSOFT";
const MS_CLIENT_ID = "REMPLACER_PAR_ID_APPLICATION_MICROSOFT";
```

Remplacer les textes entre guillemets par les identifiants copiés dans Entra ID. Ne pas modifier `DESTINATION_EMAIL` sauf si l'adresse destinataire change.

Enregistrer, envoyer le fichier modifié sur GitHub et attendre la publication de GitHub Pages.

## 4. Faire un essai

1. Ouvrir le site publié en HTTPS.
2. Renseigner le foyer et le nom, puis ajouter au moins une chambre. Le numéro de série du lit est obligatoire ; les autres équipements sont facultatifs.
3. Cliquer sur **Terminer l'inventaire et envoyer le PDF**.
4. Lors de la première utilisation, une fenêtre Microsoft s'ouvre. Se connecter avec `maintenance@euromed-materiel-medical.com` et accepter les autorisations demandées.
5. Vérifier la réception du message et la présence du PDF en pièce jointe.

Le message est envoyé à `maintenance@euromed-materiel-medical.com` depuis le compte Microsoft 365 connecté. Une copie du PDF est aussi téléchargée sur l'appareil. Le site affiche une confirmation seulement si Microsoft Graph accepte l'envoi.

## Mesures de protection des données (RGPD)

- La finalité annoncée est la réalisation et la transmission de l'inventaire du matériel. Ne saisissez pas de données de santé ni d'informations personnelles qui ne sont pas nécessaires.
- Les données de travail sont conservées localement dans le navigateur utilisé ; elles ne sont pas synchronisées par GitHub Pages.
- Après confirmation de l'envoi par Microsoft Graph, l'application supprime automatiquement les données de travail du stockage local et vide les champs du formulaire. Le PDF téléchargé et le message dans la boîte Microsoft 365 ne sont pas supprimés automatiquement.
- Un bouton permet d'effacer manuellement les données locales. L'effacement du stockage du navigateur ne supprime pas les fichiers PDF déjà téléchargés ni les courriels envoyés.
- La notice de confidentialité intégrée est un modèle de transparence et ne certifie pas la conformité RGPD. Avant la mise en production, EuroMed doit documenter la base légale, définir et documenter les durées de conservation du PDF et des courriels, identifier les sous-traitants et leurs conditions, valider les droits des personnes et les coordonnées du responsable de traitement/DPO le cas échéant.
- Les scripts nécessaires sont chargés depuis des CDN tiers (jsDelivr et Microsoft). Il faut évaluer ces dépendances, leurs journaux et les transferts éventuels dans le cadre de l'analyse de conformité.

## Données et limites

- Les chambres non encore envoyées sont conservées dans le stockage local du navigateur sur l'appareil utilisé. Elles ne sont pas synchronisées entre appareils. Ne pas effacer les données du navigateur avant d'avoir envoyé le PDF.
- L'application ne demande que `User.Read` et `Mail.Send` en autorisations déléguées ; elle n'utilise pas d'identifiants de serveur.
- L'envoi d'une pièce jointe PDF par l'API Graph en une seule requête convient aux fichiers de taille modérée. Pour un très grand inventaire ou un PDF dépassant les limites d'une pièce jointe simple, il faudra adapter la méthode d'envoi.
- Si le compte connecté n'est pas `maintenance@euromed-materiel-medical.com`, l'application refuse l'envoi pour éviter d'envoyer depuis une autre boîte aux lettres.
- La génération PDF et l'envoi nécessitent une connexion Internet. Les scans déjà ajoutés restent enregistrés localement si la page est fermée, dans la limite du stockage du navigateur.
