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


## Fonctions 49 à 88 — ShinyDex Plus v8

Depuis la version v7, l’onglet **Plus** de la barre de navigation iPhone ouvre une page d’accueil dédiée aux huit nouveaux outils. Les scripts sont préchargés pour que l’interface soit utilisable hors ligne après une première ouverture en ligne.


Les nouvelles pages sont disponibles dans le menu **Collection avancée** et **Outils avancés**. Les paramètres modifiés avant la connexion au serveur sont conservés sur cet appareil puis synchronisés avec le nouvel onglet **14 App · Organisation** lorsque la nouvelle API est installée.

| # | Fonction | État en v7 |
|---:|---|---|
| 49 | Boîtes Pokémon HOME de 30 cases, copies séparées et glisser-déposer | ✅ |
| 50 | Cartes retournables shiny / photo | ◐ (visuel normal à consolider) |
| 51 | Carte des régions | ◐ neuf tuiles régionales interactives, pas de carte géographique réelle |
| 52 | Effets lumineux shiny | ◐ scintillement discret des indicateurs |
| 53 | Tableau de bord personnalisable | ✅ quatre compteurs réordonnables et masquables |
| 54 | Formats compact, standard et grand | ✅ |
| 55 | Couleurs de thème | ◐ palette manuelle, sans lecture automatique du favori |
| 56 | Contraste, taille de texte, animations réduites | ✅ |
| 57 | Annuler une rencontre de compteur | ✅ historique limité aux dernières actions locales |
| 58 | Vibration et bip originaux | ✅ si le navigateur le permet |
| 59 | Compteur plein écran | ✅ sur appareils compatibles, overlay sinon |
| 60 | Sessions chronométrées avec pause / reprise | ✅ |
| 61 | Gestion des phases | ✅ |
| 62 | Chaînes SOS / Poké Radar et ruptures | ✅ compteur de chaîne générique |
| 63 | Lots d’œufs +5 / +30 | ✅ |
| 64 | Minuteur sandwich de 30 minutes | ✅ |
| 65 | Résolution des conflits multi-appareils | ◐ révision serveur pour les compteurs, les autres actions restent à consolider |
| 66 | Préréglages de chasse | ✅ pas de taux garantis : vérifier le jeu et les bonus |
| 67 | Baron shiny / Shalpha | ✅ |
| 68 | Marques, rubans, tailles | ✅ |
| 69 | Historique des transferts | ✅ |
| 70 | Parties distinctes par jeu / console | ✅ |
| 71 | Pokédex de DLC indépendants | ◐ listes personnalisées par numéros nationaux, pas de catalogue officiel prérempli |
| 72 | Collections de formes complexes | ◐ groupes ciblés depuis les formes déjà référencées |
| 73 | Besoin d'espèces pour une famille évolutive | ◐ suivi par espèce, copies par évolution à perfectionner |
| 74 | Album de photos | ◐ photos via URL, pas de transfert de fichiers intégré |
| 75 | Recherche par boîte et partie | ◐ vue par boîte, fiches de partie ; recherche globale à étendre |
| 76 | Shiny-lock par jeu et rencontre | ◐ quelques règles sourcées, liste non exhaustive |
| 77 | Carte thermique de 365 jours | ✅ |
| 78 | Probabilité cumulée indicative | ✅ selon un taux saisi manuellement |
| 79 | Tentatives par heure | ✅ sur tentatives et sessions chronométrées compatibles uniquement |
| 80 | Phases de malchance | ◐ phase maximum suivie |
| 81 | Shinies par type Pokémon | ✅ après chargement manuel des données PokéAPI |
| 82 | Moyenne mobile de capture | ✅ basé sur dates enregistrées |
| 83 | Projection d'achèvement | ✅ indicative, masquée sans données récentes |
| 84 | Qualité du journal, champs incomplets | ✅ |
| 85 | Livre illustré PDF | ✅ via la fonction Imprimer / Enregistrer en PDF du navigateur |
| 86 | Profil partageable avec confidentialité | ◐ export HTML sélectif, sans hébergement public automatique |
| 87 | Carte Story Instagram 1080 × 1920 | ✅ |
| 88 | Historique de versions et restauration | ✅ en local (jusqu’à 8 sauvegardes) ; aucune restauration destructive dans Sheets |

⚠️ **Important** : les fonctionnalités ✅ correspondent au comportement implémenté côté application et contrôlé par analyse de code/rendu simulé. La synchronisation réelle Google Sheets n'est pas encore validée car l'utilisateur doit toujours ajouter le fichier Apps Script serveur et autoriser le déploiement. Pour toute opération enregistrée hors ligne, attendre la confirmation d'envoi et ne pas vider les données locales.

### Remarques sur les données enrichies

Les champs Baron shiny, marques, rubans, taille, console et partie de jeu sont enregistrés dans les métadonnées associées à l'ID de la capture, sans modifier tes numéros nationaux. Un exemplaire peut être affecté à un emplacement HOME grâce à une notation \`B1:01@0\`, \`B1:02@1\` pour les doublons d'une même ligne. Les listes DLC, boîtes, sessions et paramètres sont enregistrés en JSON dans **14 App · Organisation** lorsque la synchronisation est activée.

Les informations shiny-lock décrivent **une rencontre et un jeu**, pas une impossibilité globale de l'espèce. Les calculs de probabilité sont statistiques, non prédictifs.


## ShinyDex v8 — Options sélectionnées (90 à 128)

Cette livraison ajoute 24 options demandées. Elles apparaissent dans **Plus** sur iPhone et dans le menu latéral sur ordinateur. Le catalogue d'origine, les 285 captures historiques, les 347 exemplaires et les statistiques déjà enregistrées ne sont pas réécrits.

| Option | Fonction | État v8 |
|---:|---|---|
| 90 | Assistant de chasse Légendes Pokémon : Z-A | ✅ compteurs de cycles, zones, méthodes et notes; pas de reconnaissance automatique |
| 91 | Planificateur Écarlate/Violet | ✅ suivi KO 30/60, sandwich, charme et contrôles de rencontres |
| 93 | Poké Radar | ✅ version, chaîne, record, resets; calcul des taux par patch laissé au guide de référence |
| 94 | Safari des Amis | ✅ fiches type, ami, 3 emplacements, rencontres |
| 95 | SOS Alola | ✅ chaîne et suivi indicatif des PP |
| 96 | Expéditions Dynamax | ✅ compteur d’expéditions, prises, routes et probabilités d'au moins un shiny |
| 97 | Shiny Living Form Dex | ◐ formes conservables du catalogue actuel et liens à des captures |
| 102 | Différences mâle/femelle | ◐ sélection de familles, à compléter |
| 103 | Détection de données incohérentes | ◐ règles prudentes, non exhaustives |
| 105 | Statistiques Full Odds | ✅ pour les captures où le statut est renseigné |
| 106 | Top chasses chanceuses/malchanceuses | ✅ uniquement si le taux personnel 1/N est saisi |
| 107 | Statistiques Poké Balls | ✅ pour les captures renseignées |
| 110 | Statistiques consoles | ✅ pour les captures renseignées |
| 112 | Rendement chronométré par méthode | ◐ tentatives/h et chasses abouties à partir des sessions, non comparable aux données historiques |
| 113 | Widget d’écran d’accueil | ◐ widget **dans la PWA**, pas widget natif iOS |
| 117 | Compteur vidéo / détection expérimentale | ◐ caméra locale + variation d’image + validation manuelle; **aucune détection shiny fiable** |
| 120 | Centre de synchronisation | ✅ file locale, erreurs, relance/export; serveur à installer |
| 121 | Pokémon du jour | ✅ proposition stable du jour, modifiable |
| 122 | Défis hebdomadaires | ✅ progression suivie lorsque l'information est disponible |
| 123 | Niveau de dresseur virtuel | ✅ XP basé sur le journal et les objectifs |
| 124 | Musée des shiny favoris | ✅ collection de captures mises en vitrine |
| 125 | Frise chronologique | ✅ captures dont la date est renseignée |
| 127 | Bingo shiny 3×3 / 5×5 | ✅ grille manquants, cases validées par la collection |
| 128 | Rétrospective annuelle interactive | ✅ sélection d’année, statistiques et record |

### Sécurité, limites et synchronisation de la v8

- Les nouveaux écrans enregistrent leurs données dans le même mécanisme d'attente locale que la v7, puis dans le classeur via **14 App · Organisation** après installation et redéploiement du fichier **ShinyDexAPI.gs**.
- Les métadonnées du journal ont été étendues dans **08 App · Métadonnées**, colonnes AA:AD : probabilité 1/N explicitement saisie, conditions, heure de capture et méthode précise.
- **Ne remplace pas l'ancien Code.gs**. Le fichier ShinyDexAPI.gs actuel sur GitHub comprend ces nouveaux champs ; il doit être installé dans Apps Script depuis cette version avant de redéployer.
- Le site public ne contient que l'instantané préchargé des données de chasse déjà publié ; les nouveaux champs individuels ne sont pas ajoutés au dépôt.
- Les odds pour ZA, SV, SOS, Radar et Dynamax sont contextualisés. Les compteurs de cycles, apparitions et Pokémon capturés représentent des unités distinctes ; aucune conversion automatique abusive n'est appliquée.
- Safari/iOS ne permet pas de produire un widget natif du système depuis une simple PWA. La version proposée est une carte de compteur **dans l'application** ouverte depuis son icône d'accueil.
- L'atelier vidéo exige une permission de caméra ; le flux n'est pas envoyé à un serveur, et le compteur n'augmente que par appui manuel.
- **Tests à effectuer** : validation du formulaire sur iPhone, écriture réelle vers Apps Script une fois connecté, restauration sur deuxième appareil et cohérence des compteurs en cas d'éditions simultanées.


## Refonte graphique v9 — Observatoire chromatique

La v9 est une refonte **présentationnelle** : aucune ligne de capture n'est réécrite, aucun identifiant de capture n'est changé et la connexion Apps Script reste optionnelle tant qu'elle n'a pas été installée.

- **Accueil illustré** : vitrine de trois shinies du journal, grand titre, progression globale et raccourcis directs vers Pokédex, chasses, boîtes HOME et outils.
- **Barre latérale restructurée** : 5 entrées principales et 4 groupes repliables pour retrouver les 30 vues sans défiler dans une liste unique.
- **Répertoire d'outils** : 19 outils regroupés en 5 catégories, avec recherche instantanée et message quand aucun résultat ne correspond.
- **Pokédex** : meilleure distinction visuelle entre obtenu et manquant, bordures associées à la génération, cartes plus lisibles et compteurs récapitulatifs.
- **Journal sur téléphone** : tableau remplacé visuellement par des cartes avec libellés sur les petits écrans (les données et les boutons d'édition restent inchangés).
- **Navigation mobile** : accès rapide à l'ajout d'un shiny, bouton de recherche dans la barre supérieure, éléments tactiles plus confortables.
- **Modes sombre, clair et galaxie** : respectés et adaptés, avec prise en compte de la réduction des animations.
- **Hors connexion** : fichiers `design-v9.css` et `design-v9.js` inclus dans la nouvelle version du service worker `hawaryou-shinydex-v9`.

**Limites :** les contrôles de syntaxe et les références d'assets ont été validés à partir du dépôt GitHub, mais le rendu final n'a pas été inspecté visuellement sur un iPhone réel. Si la PWA conserve l'ancienne interface, l'ouvrir en ligne et actualiser après publication de GitHub Pages. L'API Apps Script et la synchronisation multi-appareils ne sont pas activées par la refonte graphique.

## ShinyDex v10 — 25 améliorations choisies

Cette version ajoute 16 vues. Elle conserve les captures historiques et le fonctionnement hors connexion. Les nouvelles notes de session sont stockées séparément dans les données avancées.

| Option | Fonction | État |
|---:|---|---|
| 129 | Comparateur normal/shiny | ✅ Curseur |
| 130 | Galerie immersive | ✅ Plein écran et navigation |
| 131 | Atlas interactif des régions | ◐ Schéma non géographique |
| 132 | Thèmes par jeu | ✅ Couleurs personnalisables |
| 133 | Tableau de bord libre | ◐ Ordre et largeur réglables, pas de glisser-déposer libre |
| 134 | Cadres collector | ✅ 5 finitions par capture |
| 135 | Recherche universelle | ✅ Pokédex, captures, chasses, notes et boîtes |
| 136 | Filtres enregistrables | ✅ Texte, méthode et jeu |
| 137 | Saisie à une main | ✅ Champs essentiels |
| 138 | Tutoriel interactif | ✅ Six étapes |
| 140 | Favoris épinglés | ✅ Galerie et accueil |
| 142 | Quatre compteurs | ✅ Multi-chasse |
| 144 | Écran toujours actif | ◐ API Screen Wake Lock compatible uniquement |
| 145 | Journal de session | ✅ Notes, pauses, changements de méthode |
| 146 | Statistiques par génération | ✅ Barres de progression |
| 147 | Courbe probabiliste | ✅ Taux 1/N à renseigner |
| 148 | Périodes sans shiny | ✅ Intervalles entre captures datées |
| 149 | Heures de capture | ✅ Uniquement les heures renseignées |
| 150 | Records saisonniers | ✅ Trimestres et années |
| 151 | Import sécurisé | ✅ Aperçu CSV/JSON, détection des doublons, 25 lignes max par validation |
| 152 | Conflits par champ | ◐ Comparaison locale/serveur ; risque de changement concurrent restant |
| 153 | Sauvegarde Google Drive quotidienne | ◐ Fonctions serveur disponibles, activation manuelle requise |
| 154 | Diagnostics de synchronisation | ✅ File, tentatives, statut et export |
| 155 | Posters collector | ✅ Impression PDF depuis le navigateur |
| 158 | Rappels de chasse | ◐ Fonctionnent pendant que l'application reste ouverte, sans Web Push serveur |

### Installation Apps Script pour les sauvegardes Drive

1. Conserver Code.gs dans le projet existant et ajouter ou remplacer ShinyDexAPI.gs par la version la plus récente de GitHub.
2. Exécuter installerShinyDex() si nécessaire et redéployer une nouvelle version /exec pour activer les champs avancés.
3. Pour lancer les sauvegardes, exécuter volontairement installerSauvegardesShinyDex() depuis l'éditeur Apps Script et accepter les autorisations Google Drive.
4. Le script crée un dossier de copies privées du classeur et un déclencheur quotidien (vers 4 h, heure de Paris). Il conserve les 30 copies automatiques les plus récentes dans ce dossier.
5. Pour arrêter les sauvegardes sans supprimer les fichiers existants : desactiverSauvegardesShinyDex().

La sauvegarde automatique et la synchronisation n'ont **pas** été activées par la seule publication des fichiers GitHub. Ne jamais vider le stockage local lorsqu'une file d'envoi contient des modifications non confirmées.

L'option 158 n'inclut pas de notification Web Push en arrière-plan : sur iPhone, elle exige l'installation de la PWA sur l'écran d'accueil, un serveur Push et l'autorisation de l'utilisateur. L'option 144 dépend également des capacités et du comportement du navigateur.

Contrôles de syntaxe et rendu des 16 nouveaux écrans effectués à partir des données préchargées. La compatibilité visuelle sur iPhone réel et les nouveaux envois Apps Script restent à tester après redéploiement.

## Dépannage

- **« Mode local »** : token absent/incorrect, API non déployée, ou navigateur hors connexion.
- **File d'attente non vide** : ne supprime pas les données du navigateur. Vérifie `12 App · Opérations` et le journal d'exécution Apps Script.
- **Échec 403 / 404 / demande Google** : vérifie les autorisations et la version publiée dans « Gérer les déploiements ».
- **« Aucune donnée reçue »** : le POST doit contenir un champ `payload` JSON ; utilise le `doPost(e)` fourni.
- **Images invisibles** : vérifie la connexion aux sprites PokéAPI et essaie le style pixel.
- **Plus de 1500 captures** : étends les plages de formules et de validations du journal avant de dépasser les bornes du classeur.
- **Déploiement non visible** : vérifie que GitHub Pages sert bien la branche `main` du dépôt `test`.

Ce projet n'est ni affilié ni approuvé par The Pokémon Company ou Nintendo. Le catalogue est indicatif et doit être actualisé pour les jeux et espèces futures.
