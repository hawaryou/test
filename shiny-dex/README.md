# ✨ ShinyDex Hawaryou — application web & iPhone

**Application :** https://hawaryou.github.io/test/shiny-dex/  
**Code du site :** https://github.com/hawaryou/test/tree/main/shiny-dex  
**Google Sheets central :** https://docs.google.com/spreadsheets/d/1Ikt96ssgDPlfan7PKh3GQI4rjYpldzXJN_t9grx5L3M/edit

Application personnelle développée pour le Shiny Living Dex de **hawaryou**, à partir d'un catalogue de **1 025 espèces**, **288 entrées de formes** et **53 références de jeux**. Le classeur conserve les **285 lignes historiques et 347 exemplaires** existants. Ces données **ne sont pas placées dans le dépôt public** : elles ne sont chargées qu'après connexion sécurisée à Apps Script.

## Copie de collection préchargée (sans Apps Script)

Depuis le **15 novembre 2026**, `snapshot.js` charge directement **285 entrées historiques**, représentant **347 exemplaires** et **124 997 tentatives renseignées**. Cette copie a été générée depuis l'onglet `02 Journal de chasse` du Google Sheets existant.

- Elle est **publique**, car le dépôt GitHub Pages est public ; les données incluses se limitent aux numéros, jeux, méthodes, tentatives, quantités, statut du Charme Chroma, dates et formes. Aucun identifiant d'authentification, token ou note personnelle n'est inclus.
- Elle est chargée automatiquement en mémoire locale lors de la première ouverture, même sans Apps Script.
- L'historique intégré n'est **jamais mis en file d'écriture**, car il se trouve déjà dans Google Sheets.
- Les nouveaux shiny ou compteurs ajoutés avant la configuration de l'API sont enregistrés **localement**. Le transfert dans Google Sheets attend la connexion et la confirmation du déploiement.
- Quand l'API sera installée et connectée, Google Sheets devient la source principale ; les identifiants `SH-0001` à `SH-0285` sont conservés pour éviter les doublons lors du rapprochement.
- L'instantané n'est pas une synchronisation automatique : les mises à jour du classeur faites en dehors de l'application n'y apparaîtront qu'après activation de l'API ou publication d'un nouvel instantané.

## Démarrage — connexion à Google Sheets (nécessaire)

Le Google Apps Script actuellement déployé ne possède pas encore automatiquement les nouveaux points d'accès de l'application. Le fichier `ShinyDexAPI.gs` doit être ajouté manuellement au projet Apps Script.

1. Ouvre le **projet Apps Script rattaché au Google Sheets**.
2. Dans Apps Script, clique sur **+ → Script**, donne-lui le nom `ShinyDexAPI`.
3. Copie **tout le contenu de [ShinyDexAPI.gs](./ShinyDexAPI.gs)** dans ce nouveau fichier. **Garde ton ancien Code.gs** (saisie rapide) intact.
4. Enregistre. Dans le sélecteur de fonctions, exécute une fois **`installerShinyDex`**. Autorise l'accès au classeur demandé par Google.
5. Ouvre **Exécutions / Journal d'exécution** et récupère la ligne `SHINYDEX TOKEN`. **Conserve ce code de 64 caractères privé.**
6. **Déployer → Gérer les déploiements → Modifier** ton déploiement existant → choisis une **nouvelle version** → déploie. Conserve le lien `/exec`. L'application sur GitHub Pages nécessite que l'Application Web soit accessible depuis ton navigateur sans redirection de connexion Google ; une configuration « Toute personne » est généralement nécessaire, et le code secret protège alors les opérations. **Ne l'utilise pas pour des données sensibles.**
7. Ouvre l'[application ShinyDex](https://hawaryou.github.io/test/shiny-dex/), va dans **Paramètres → Google Sheets**. Vérifie le lien `/exec`, colle le code secret et clique **Connecter et synchroniser**.

Le lien initial configuré dans l'app est :

`https://script.google.com/macros/s/AKfycbw3Fr5gPtSplDg8FKNBndSy2cJiCa1uyw62lIuW-j9nRCWTLj88mx4on9nGmLAi-YzMlg/exec`

**Important :** le site statique est fonctionnel sans Apps Script (exploration du catalogue, captures locales, calculs). **Ne considère pas une capture comme sauvegardée dans Google Sheets tant que la connexion n'est pas validée.** Une file locale conserve les opérations à retransmettre. Le badge « connecté » ne s'affiche qu'après une réponse valide du serveur.

### Utilisation sur iPhone

Ouvre le lien dans **Safari** → bouton **Partager** → **Sur l'écran d'accueil**. La PWA s'ouvre comme une application, avec menus adaptés au tactile. Les fichiers d'interface sont conservés hors ligne via un service worker. Les données précédemment chargées restent en cache local, mais les **sprites distants peuvent manquer** si l'iPhone est hors réseau.

### Sauvegarde, restauration et confidentialité

- Le **journal Google Sheets original** est la source de vérité pour les captures. Ne le supprime pas.
- Les nouveaux onglets `08 App · Métadonnées`, `09 App · Chasses`, `10 App · Objectifs`, `11 App · Événements`, `12 App · Opérations`, `13 App · Souhaits` existent dans le même classeur.
- À chaque écriture, l'API utilise un identifiant d'opération pour éviter les doublons lors des répétitions de connexion.
- Une modification hors ligne reste dans le navigateur jusqu'à **confirmation de l'opération** ; ne vide pas ses données locales tant que la file d'attente n'est pas vide.
- Le **code secret** est stocké localement dans le navigateur. Comme tout secret dans un navigateur, il est vulnérable sur un appareil partagé ou compromis. Les requêtes de lecture JSONP exposent le token dans leur URL réseau. Préfère un appareil personnel, et pour des données sensibles un backend OAuth serveur serait nécessaire.
- **Aucune donnée individuelle de capture n'est publiée dans ce dépôt GitHub.** Les images proviennent de la bibliothèque [PokéAPI Sprites](https://github.com/PokeAPI/sprites).
- Les exports Pokémon Element SH sont des fichiers **à traiter manuellement** : aucune API d'écriture officielle n'a été vérifiée.

## Matrice des 48 options

| # | Fonction | Statut |
|---:|---|---|
| 1 | Galerie de 1 025 Pokémon | ✅ |
| 2 | Sprites animés, selon disponibilité | ✅ (facultatif, images externes) |
| 3 | Pokémon manquants en gris | ✅ |
| 4 | Décors différents par génération | ◐ accents et pastilles uniquement |
| 5 | Thèmes clair / sombre / galaxie | ✅ |
| 6 | Progression circulaire par génération | ✅ anneau global + mini-anneaux par région |
| 7 | Familles évolutives | ✅ chargement à la demande depuis PokéAPI |
| 8 | Filtres génération, type, statut | ✅ (type : connexion PokéAPI) |
| 9 | Recherche prédictive | ◐ recherche instantanée ; sélection de capture par liste |
| 10 | Cartes de légendaires et fabuleux | ◐ effet distinctif sur une sélection vérifiée de numéros nationaux |
| 11 | Ajout rapide accessible partout | ✅ |
| 12 | Recherche par nom ou n° national | ✅ |
| 13 | Image dynamique lors de la saisie | ✅ aperçu shiny lors de la sélection |
| 14 | Jeu et méthode mémorisés | ✅ |
| 15 | Enregistrer puis saisir le suivant | ✅ |
| 16 | Photo personnelle | ◐ lien d'image stocké, transfert d'un fichier non implémenté |
| 17 | Poké Ball, surnom, sexe, nature, lieu | ✅ |
| 18 | Doublons & quantités | ✅ |
| 19 | Shinies par méthode | ✅ |
| 20 | Tentatives par méthode | ✅ |
| 21 | Moyennes et médianes | ✅ |
| 22 | Records de chasse | ✅ minimum, médiane, maximum, record personnel |
| 23 | Statistiques par jeu | ✅ |
| 24 | Générations comparées | ✅ |
| 25 | Stats hebdo / mensuelles / annuelles | ✅ vues hebdo / mensuelles / annuelles et export mensuel |
| 26 | Évolution de la collection depuis 2016 | ✅ année par année |
| 27 | Comparer avec/sans Charme Chroma | ✅ tableau des chasses, tentatives et moyennes par statut du charme |
| 28 | Probabilités théoriques | ◐ calculateur avec taux réglable |
| 29 | Formes Alola / Galar / Hisui | ✅ catalogue de variantes |
| 30 | Distinction mâle / femelle | ✅ via métadonnées |
| 31 | Formes alternatives | ✅ catalogue |
| 32 | Méga-Évolutions et formes spéciales | ◐ dépend du catalogue des 288 variantes |
| 33 | Shiny-lock | ◐ notes disponibles ; liste vérifiée non complète |
| 34 | Besoin d'exemplaires pour évolutions | ◐ famille affichée + nombre d'espèces encore absentes |
| 35 | Boîte Pokémon HOME | ✅ champ par capture |
| 36 | Possédé / évolué / échangé / perdu | ✅ |
| 37 | Compteur +1 / +5 / +10 | ✅ |
| 38 | Plusieurs chasses simultanées | ✅ |
| 39 | Multiplicateur pour les hordes | ✅ |
| 40 | Sessions et durées | ◐ date de début, résultats et événements ; chronométrage à compléter |
| 41 | Objectifs personnalisés | ✅ |
| 42 | Cible aléatoire | ✅ |
| 43 | Jeux & méthodes possibles par Pokémon | ☐ base de disponibilité à construire |
| 44 | Shinies ratés | ✅ événement d'échec et chasse terminée |
| 45 | Carte de collection partageable | ✅ export PNG |
| 46 | Récompenses virtuelles | ✅ |
| 47 | Rapport mensuel | ◐ génération manuelle, sans programmation automatique |
| 48 | Synchronisation Pokémon Element SH | ☐ non disponible sans interface d'import autorisée (export CSV proposé) |

**Légende :** ✅ disponible ; ◐ disponible en partie ; ☐ à développer, **non annoncé comme terminé**.

## Architecture

- `index.html` : structure d'application
- `styles.css` : thème graphique responsive et design mobile
- `catalog.js` : catalogue public sans historiques privés
- `core.js` : modèles, statistiques, cache local et synchronisation
- `app.js` : affichage du Pokédex, fiches, objectifs, compteurs, cartes
- `ShinyDexAPI.gs` : API Apps Script à installer dans ton projet, écritures Google Sheets
- `manifest.webmanifest`, `sw.js`, `icon.svg` : installation PWA / service worker

## Dépannage

- **« Mode local »** : token absent/incorrect, API non déployée, ou navigateur hors connexion.
- **File d'attente non vide** : ne supprime pas les données du navigateur. Vérifie `12 App · Opérations` et le journal d'exécution Apps Script.
- **Échec 403 / 404 / demande Google** : vérifie les autorisations et la version publiée dans « Gérer les déploiements ».
- **« Aucune donnée reçue »** : le POST doit contenir un champ `payload` JSON ; utilise le `doPost(e)` fourni.
- **Images invisibles** : vérifie la connexion aux sprites PokéAPI et essaie le style pixel.
- **Plus de 1500 captures** : étends les plages de formules et de validations du journal avant de dépasser les bornes du classeur.
- **Déploiement non visible** : vérifie que GitHub Pages sert bien la branche `main` du dépôt `test`.

Ce projet n'est ni affilié ni approuvé par The Pokémon Company ou Nintendo. Le catalogue est indicatif et doit être actualisé pour les jeux et espèces futures.
