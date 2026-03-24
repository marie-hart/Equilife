# Checklist de mise en production

## 1. Variables d'environnement (obligatoires)

Créer un `.env` à la racine du projet (utilisé par docker-compose).

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DB_PASSWORD` | **Oui** | Mot de passe PostgreSQL. Différent de `horse_password`. |
| `CORS_ORIGIN` | **Oui** | Origine(s) du frontend, séparées par des virgules (ex: `https://app.equilife.com`). |

## 2. Docker Compose en production

### Base de données

Pour que Postgres utilise le même mot de passe que le backend, créer un override ou modifier le `docker-compose.yml` pour :

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: ${DB_PASSWORD}
```

Puis exécuter les migrations avec le même mot de passe :
```bash
DB_PASSWORD=votre_mot_de_passe docker-compose run --rm sqitch deploy
```

### Services à lancer

```bash
docker-compose up -d postgres redis backend front
# + api-proxy si vous servez l'API en HTTPS
```

## 3. Certificats SSL

- **API (api-proxy)** : placer les certificats dans `certs/cert.pem` et `certs/key.pem`.
  - En production : Let's Encrypt, certificat commercial, ou reverse proxy (Traefik, Caddy) qui gère le TLS.
  - En dev local : `./scripts/setup-api-certs.sh`

- **Frontend** : si servi derrière un reverse proxy (Nginx, Caddy, Traefik), le TLS est géré en amont.

## 4. URL de l'API côté frontend

Le frontend appelle l'API via `VITE_API_BASE_URL` (valeur au moment du build).

- **Même domaine** (ex. `https://app.example.com` pour le front et `https://app.example.com/api` pour l'API) : configurer le reverse proxy pour router `/api` vers le backend, puis build avec `VITE_API_BASE_URL=/api`.
- **Sous-domaine dédié** (ex. `https://api.example.com`) : build avec `VITE_API_BASE_URL=https://api.example.com`.

Exemple de build avec l’URL de l’API :
```bash
cd front
VITE_API_BASE_URL=https://api.votredomaine.com yarn build
```

## 5. Sécurité

- Ne jamais committer `.env`, certificats ou secrets.
- `DB_PASSWORD` ≠ `horse_password` en production (contrôlé par le backend).
- `CORS_ORIGIN` doit contenir uniquement les origines autorisées.
- Authentification optionnelle : `AUTH_ENABLED=true` + `JWT_SECRET` + `APP_PIN` (voir `docs/SECURITY.md`).

## 6. PM2 (redémarrage automatique)

Le backend utilise **PM2** : en cas de crash, le processus est relancé (backoff, limite de redémarrages). La configuration est dans `back/ecosystem.config.cjs`.

- **Docker** : `yarn start` lance `pm2-runtime` (process au premier plan, adapté aux conteneurs).
- **VPS / serveur sans Docker** :
  ```bash
  cd back && yarn install && yarn build
  npx pm2 start ecosystem.config.cjs
  npx pm2 save
  npx pm2 startup   # suivre les instructions pour systemd
  ```
- Pour lancer Node sans PM2 (debug) : `yarn start:node`.

## 7. Vérifications avant mise en ligne

- [ ] `.env` créé avec `DB_PASSWORD` et `CORS_ORIGIN`
- [ ] Postgres et backend configurés avec le même `DB_PASSWORD`
- [ ] Migrations Sqitch exécutées
- [ ] Certificats SSL configurés pour l’API (si HTTPS)
- [ ] Frontend buildé avec la bonne `VITE_API_BASE_URL`
- [ ] Test du health check : `GET /health` sur l’API
- [ ] Test du flux complet : frontend → API → base de données
