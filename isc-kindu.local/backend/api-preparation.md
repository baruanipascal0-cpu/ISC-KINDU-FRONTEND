# Preparation API ISC KINDU

Ce fichier prepare la connexion backend du site. Les pages d'inscription utilisent deja les attributs `data-api-module`, `data-api-endpoint` et les actions de formulaire prevues.

## Parcours inscription

1. `POST /api/auth/register` cree le compte etudiant.
2. `POST /api/auth/login` connecte l'etudiant.
3. `POST /api/inscriptions` enregistre le dossier dans la base de donnees de l'institution.
4. `GET /api/student/dashboard` charge le portefeuille etudiant.

## Modules du site

Les modules a raccorder au backend sont listes dans `backend/api-routes.json` : site, accueil, sections, actualites, publications, evenements, authentification, inscriptions, espace etudiant, contact et administration.

## Configuration production

Le fichier `assets/custom/backend-api.js` choisit l'URL du backend dans cet ordre:

1. `window.ISC_BACKEND_ORIGIN`
2. `window.ISC_KINDU_BACKEND_URL`
3. l'attribut `data-backend-origin` sur le script `backend-api.js`
4. la balise `<meta name="isc-backend-origin" content="https://votre-backend.onrender.com">`
5. `localStorage.ISC_BACKEND_ORIGIN`
6. par defaut, `https://isc-kindu-backend.onrender.com`

Si Render a donne une autre URL au backend, remplacer cette valeur ou ajouter une balise meta avant le chargement de `backend-api.js`.
