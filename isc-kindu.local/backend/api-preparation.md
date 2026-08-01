# Preparation API ISC KINDU

Ce fichier prepare la connexion backend du site. Les pages d'inscription utilisent deja les attributs `data-api-module`, `data-api-endpoint` et les actions de formulaire prevues.

## Parcours inscription

1. `POST /api/auth/register` cree le compte etudiant.
2. `POST /api/auth/login` connecte l'etudiant.
3. `POST /api/inscriptions` enregistre le dossier dans la base de donnees de l'institution.
4. `GET /api/student/dashboard` charge le portefeuille etudiant.

## Modules du site

Les modules a raccorder au backend sont listes dans `backend/api-routes.json` : site, accueil, sections, actualites, publications, evenements, authentification, inscriptions, espace etudiant, contact et administration.
