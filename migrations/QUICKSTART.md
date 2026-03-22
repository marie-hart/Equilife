# Démarrage rapide des migrations

## Problème de connexion ? 

Si vous voyez l'erreur `password authentication failed`, suivez ces étapes :

### 1. Démarrer PostgreSQL

```bash
cd /chemin/vers/equilife-app
docker-compose up -d postgres
```

Attendez quelques secondes que PostgreSQL soit prêt (vérifier avec `docker-compose ps`).

### 2. Vérifier que PostgreSQL fonctionne

```bash
docker-compose ps
```

Vous devriez voir `equilife_postgres` avec le statut "Up".

### 3. Créer le fichier .env (optionnel mais recommandé)

```bash
cd migrations
cp .env.example .env
```

Vous pouvez modifier `.env` si vos identifiants sont différents.

### 4. Exécuter les migrations

```bash
./run-migrations.sh
```

Le script vérifie automatiquement la connexion avant d'exécuter Sqitch.

## Alternative : Utiliser Docker directement

Si vous avez des problèmes avec la connexion locale, utilisez le conteneur Docker Sqitch :

```bash
cd migrations
docker run --rm \
  --network equilife-app_default \
  -v $(pwd):/migrations \
  -e PGUSER=horse_user \
  -e PGPASSWORD=horse_password \
  -e PGHOST=postgres \
  -e PGPORT=5432 \
  -e PGDATABASE=equilife_db \
  sqitch/sqitch:latest \
  sqitch deploy db:pg://horse_user:horse_password@postgres:5432/equilife_db
```

Ou utilisez directement docker-compose pour tout :

```bash
docker-compose up -d
```

Cela démarre PostgreSQL, exécute les migrations automatiquement, puis démarre le backend.

