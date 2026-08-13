# ISC Kindu Frontend

Ce depot contient le site public statique publie sur Cloudflare.

## Structure active

- `www.isig.ac.cd/*.html` : pages publiques conservees pour compatibilite.
- `www.isig.ac.cd/js/isc-kindu.js` : script partage du site public, connexion API, menu mobile, recherche, contenus backend.
- `www.isig.ac.cd/js/isc-student.js` : espace etudiant, tableau de bord, documents, paiements, notifications.
- `www.isig.ac.cd/actualite.html` : page de detail dynamique pour actualites et publications.
- `www.isig.ac.cd/_redirects` : redirections Cloudflare vers le backend admin/API et anciens chemins.
- `www.isig.ac.cd/_headers` : entetes de securite et cache Cloudflare.

## Backend utilise

Le frontend consomme par defaut :

```text
https://isc-kindu-backend.onrender.com/api
```

Le bouton `AMG` pointe vers :

```text
https://isc-kindu-backend.onrender.com/admin/login
```

## Regle de maintenance

Les nouveaux contenus doivent venir du backend admin autant que possible : actualites, publications, documents, frais, medias, blocs institutionnels, paiements, recus et notifications etudiants.
