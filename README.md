# MYZ

Portail de campagne prive pour `Mutant Year Zero`, concu comme un site statique multi-pages branche sur Firebase.

Le depot contient plusieurs mini-applications HTML autonomes partageant :

- un theme global charge depuis Firestore ;
- une authentification Firebase commune ;
- un mini-CMS pour certains textes d'interface ;
- une synchronisation temps reel Firestore pour les donnees de campagne.

## Vue d'ensemble

Le portail sert de table de campagne / tableau de bord pour suivre :

- l'Arche ;
- la Zone ;
- la Toile des relations ;
- la Chronique de campagne ;
- la configuration visuelle et textuelle du portail.

Le point d'entree est `index.html`, qui sert de hub vers les autres pages.

## Structure du depot

- `index.html` : portail d'accueil.
- `arche-myz.html` : suivi de l'Arche (developpement, population, projets, caids, artefacts, menaces, journal).
- `zone.html` : carte interactive de la Zone avec secteurs, notes, danger, PNJ, objets et calibration locale.
- `relations.html` : graphe des relations entre PJ, PNJ, factions et lieux.
- `chronique.html` : suivi des seances et des moments marquants de la campagne.
- `config.html` : interface d'administration pour le theme et les textes CMS.
- `myz-theme.css` : base visuelle commune.
- `theme-init.js` : chargement du theme depuis Firestore avec fallback local.
- `content-init.js` : mini-CMS pour injecter les textes `data-content`.
- `auth-init.js` : initialisation Firebase Auth + Firestore, session persistante, helpers login/logout.
- `firestore.rules` : copie locale des regles Firestore. Peut etre en retard si les regles deployees ont evolue.
- `carte.jpg` : fond de carte utilise par `zone.html`.

## Stack technique

- HTML / CSS / JavaScript vanilla ;
- aucune phase de build ;
- dependances chargees par CDN ;
- Firebase Auth ;
- Cloud Firestore ;
- `Leaflet` pour la carte de la Zone ;
- `vis-network` pour la Toile des relations.

Le projet est pense pour un hebergement statique de type Netlify / GitHub Pages / simple serveur web.

## Fonctionnement general

### Authentification

L'authentification passe par Firebase. Le fichier `auth-init.js` expose :

- l'app Firebase ;
- `auth` ;
- `db` ;
- `loginUser(email, password)` ;
- `logoutUser()` ;
- `onAuthStateChanged(...)`.

Un UID admin est code en dur pour les fonctions MJ / administration :

- `ADMIN_UID = NQDL7LT3zmewlfSJa69VWY6qSPU2`

Selon la page :

- certaines fonctions sont accessibles a tout utilisateur connecte ;
- certaines sont reservees au MJ / admin ;
- certaines donnees sont lisibles publiquement.

### Theme global

`theme-init.js` applique d'abord un theme par defaut, puis tente de charger la configuration distante depuis :

- `config/theme`

Cela evite le flash visuel au chargement.

### Mini-CMS

`content-init.js` remplace les elements portant `data-content` a partir :

- de valeurs par defaut locales ;
- puis des documents Firestore `content/{page}` quand ils existent.

Les pages actuellement branchees sur ce mecanisme sont surtout :

- `index.html`
- `relations.html`
- `chronique.html`
- `config.html`
- partiellement `arche-myz.html`

## Pages et donnees

### Accueil

`index.html` sert de portail vers les outils de campagne.

Contenu dynamique :

- sous-titre de page ;
- credits et mentions de footer.

### Arche

`arche-myz.html` synchronise son etat principal dans :

- `arche/main`

Contenu gere :

- nom de l'Arche ;
- session en cours ;
- nombre de PJ ;
- population ;
- niveaux de developpement ;
- figures importantes ;
- caids ;
- projets ;
- artefacts ;
- menaces ;
- notes de session ;
- journal interne.

Mode d'acces :

- lecture / ecriture pour tout utilisateur connecte ;
- certaines actions d'interface sont restreintes au MJ via le front.

### Zone

`zone.html` synchronise la carte dans :

- `zone/main`

Contenu gere :

- secteurs par case ;
- nom de lieu ;
- description ;
- danger ;
- PNJ ;
- objet ;
- note ;
- statut explore / non explore.

Specificites :

- la calibration de grille est stockee localement dans `localStorage` ;
- l'image de fond peut venir de `carte.jpg` ou d'un chargement manuel memorise localement ;
- certaines actions sont reservees au MJ dans l'interface.

### Relations

`relations.html` utilise plusieurs sous-collections :

- `relations/graph/nodes`
- `relations/graph/edges`
- `relations/graph/history`

Contenu gere :

- noeuds du graphe ;
- relations entre entites ;
- historique recent des actions.

Librairie :

- `vis-network`

Mode d'acces :

- lecture publique ;
- ecriture pour utilisateur connecte ;
- suppression reservee a l'admin dans les regles que tu m'as fournies.

### Chronique

`chronique.html` utilise :

- `chronique/data/seances`
- `chronique/data/moments`

Contenu gere :

- seances numerotees ;
- dates ;
- PJ presents ;
- tags ;
- resume markdown simplifie ;
- moments lies a une seance.

Mode d'acces :

- lecture publique ;
- ecriture pour utilisateur connecte ;
- suppression reservee a l'admin dans les regles fournies.

### Configuration

`config.html` sert de back-office.

Elle permet de modifier :

- le theme visuel global ;
- les textes du mini-CMS.

Documents concernes :

- `config/theme`
- `content/global`
- `content/index`
- `content/relations`
- `content/chronique`

Acces :

- lecture du theme publique ;
- ecriture reservee a l'admin ;
- ecriture des contenus CMS reservee a l'admin.

## Regles Firestore deployees

Les regles communiquees pour le portail sont les suivantes, au niveau fonctionnel :

- `config/theme`
  - lecture publique ;
  - ecriture admin uniquement.
- `arche/{docId}`
  - lecture / ecriture pour tout utilisateur connecte.
- `zone/{docId}`
  - lecture / ecriture pour tout utilisateur connecte.
- `profiles/{uid}`
  - lecture pour tout utilisateur connecte ;
  - ecriture uniquement par le proprietaire du profil.
- `relations/{document=**}`
  - lecture publique ;
  - ecriture pour tout utilisateur connecte ;
  - suppression de `nodes` et `edges` reservee a l'admin.
- `chronique/{document=**}`
  - lecture publique ;
  - ecriture pour tout utilisateur connecte ;
  - suppression reservee a l'admin.
- `content/{document=**}`
  - lecture publique ;
  - ecriture reservee a l'admin.

Important :

- le fichier local `firestore.rules` du depot ne reflete pas forcement l'etat reel de la BDD ;
- les regles effectivement deployees font foi.

## Profils utilisateurs

Le portail utilise aussi :

- `profiles/{uid}`

pour stocker au minimum un pseudo / nom de joueur associe au compte Firebase.

## Lancer le portail

Comme il n'y a pas de build, un simple serveur statique suffit.

Exemples :

```powershell
python -m http.server 8000
```

ou tout autre serveur local equivalent.

Ensuite ouvrir :

- `http://localhost:8000/index.html`

## Points d'attention

- Les cles Firebase sont cote client : la securite repose sur Firebase Auth + Firestore Rules.
- Une partie importante de la logique est inline directement dans les pages HTML.
- Le projet fonctionne comme un ensemble de pages autonomes plutot que comme une SPA.
- Le depot semble optimise pour un usage pratique de campagne plutot que pour une industrialisation lourde.

## A faire plus tard

- completer ce README avec une documentation d'exploitation ;
- documenter le schema exact des documents Firestore ;
- aligner si besoin `firestore.rules` local avec les regles reellement deployees ;
- ajouter un petit guide de sauvegarde / restauration des donnees de campagne.
