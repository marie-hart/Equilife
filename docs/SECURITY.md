# Sécurité et authentification

## Authentification backend

L’API utilise des **comptes utilisateurs** (e-mail + mot de passe, hachage bcrypt). Les JWT portent l’identifiant utilisateur (UUID) et sont valides 7 jours.

### Activation

1. Déployer la migration des tables `users` (et liaisons chevaux / notes rapides si besoin).
2. Dans `back/.env` :
   ```
   USER_AUTH_ENABLED=true
   JWT_SECRET=un_secret_long_et_aleatoire_min_32_caracteres
   ```

3. Le frontend affiche les écrans **Connexion** et **Inscription** ; l’utilisateur obtient un JWT via `POST /api/auth/login` (e-mail + mot de passe).

Sans `USER_AUTH_ENABLED=true`, les routes peuvent rester ouvertes (usage local uniquement).

### Routes protégées (quand auth activée)

- **Publiques** : `/`, `/health`, `/api/auth/*`, `/api/push/public-key`
- **Protégées** (JWT requis) : les autres routes API (`/api/events`, `/api/products`, `/api/horses`, etc.)

### Bonnes pratiques

- **JWT_SECRET** : minimum 32 caractères, aléatoire. Ne jamais le committer.
- Politique de mot de passe côté serveur : longueur minimale, majuscule, caractère spécial (voir `passwordPolicy` backend).

## Secrets côté frontend

Le frontend **n’expose aucun secret** :

- Pas de clé API, mot de passe ou JWT hardcodé
- Le JWT est obtenu via `POST /api/auth/login` après saisie de l’e-mail et du mot de passe
- Le token est stocké en `sessionStorage` (supprimé à la fermeture de l’onglet)
- La clé VAPID publique des notifications push est récupérée depuis le backend (elle est conçue pour être publique)

## Variables d'environnement

| Variable           | Où      | Sensible | Description |
|--------------------|---------|----------|-------------|
| DB_PASSWORD        | Backend | Oui      | **Obligatoire en prod.** Refus de "horse_password" en production. |
| CORS_ORIGIN        | Backend | Non      | **Obligatoire en prod.** Origine(s) du frontend. |
| USER_AUTH_ENABLED  | Backend | Non      | `true` pour activer comptes e-mail / mot de passe. |
| JWT_SECRET         | Backend | Oui      | Secret de signature des JWT (si auth activée). |
| VAPID_PRIVATE_KEY  | Backend | Oui      | Clé privée Web Push (jamais exposée) |
| VAPID_PUBLIC_KEY   | Backend | Non      | Exposée via `/api/push/public-key` |
| VITE_API_BASE_URL  | Frontend | Non     | URL de l’API (publique) |
