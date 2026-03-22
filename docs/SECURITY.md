# Sécurité et authentification

## Authentification backend

L'authentification est **désactivée par défaut**. L'utilisateur peut utiliser l'app sans mot de passe.

### Activation de l'authentification (optionnelle)

1. Ajouter `AUTH_ENABLED=true` dans `back/.env`
2. Définir `JWT_SECRET` et `APP_PIN` :
   ```
   AUTH_ENABLED=true
   JWT_SECRET=un_secret_long_et_aleatoire_min_32_caracteres
   APP_PIN=1234
   ```

3. Le frontend affichera automatiquement l'écran de connexion.
4. L'utilisateur entre le PIN configuré pour obtenir une session (JWT valide 7 jours).

### Routes protégées (quand auth activée)

- **Publiques** : `/`, `/health`, `/api/auth/*`, `/api/push/public-key`
- **Protégées** (JWT requis) : toutes les autres routes (`/api/events`, `/api/products`, `/api/horses`, etc.)

Sans `AUTH_ENABLED=true`, toutes les routes sont ouvertes.

### Bonnes pratiques

- **JWT_SECRET** : minimum 32 caractères, aléatoire. Ne jamais le committer.
- **APP_PIN** : code connu uniquement du propriétaire. En production, utiliser un PIN complexe.

## Secrets côté frontend

Le frontend **n'expose aucun secret** :

- Pas de clé API, mot de passe ou JWT hardcodé
- Le JWT est obtenu via `POST /api/auth/login` après saisie du PIN par l'utilisateur
- Le token est stocké en `sessionStorage` (supprimé à la fermeture de l'onglet)
- La clé VAPID publique des notifications push est récupérée depuis le backend (elle est conçue pour être publique)

## Variables d'environnement

| Variable      | Où      | Sensible | Description                          |
|---------------|---------|----------|--------------------------------------|
| DB_PASSWORD   | Backend | Oui      | **Obligatoire en prod.** Refus de "horse_password" en production. |
| CORS_ORIGIN   | Backend | Non      | **Obligatoire en prod.** Origine(s) du frontend (ex: https://app.equilife.com). |
| AUTH_ENABLED  | Backend | Non      | `true` pour activer le PIN (sinon app ouverte) |
| JWT_SECRET    | Backend | Oui      | Secret de signature des JWT (si auth activée) |
| APP_PIN       | Backend | Oui      | Code d'accès pour la connexion (si auth activée) |
| VAPID_PRIVATE_KEY | Backend | Oui  | Clé privée Web Push (jamais exposée) |
| VAPID_PUBLIC_KEY  | Backend | Non   | Exposée via `/api/push/public-key`   |
| VITE_API_BASE_URL | Frontend | Non | URL de l'API (publique)              |
