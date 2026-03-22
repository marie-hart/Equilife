# Migrations Sqitch

Ce dossier contient toutes les migrations de base de données gérées par Sqitch.

## Structure

```
migrations/
├── init/                    # Migration initiale
│   ├── deploy/             # Script de déploiement
│   ├── revert/             # Script de rollback
│   └── verify/             # Script de vérification
├── sqitch.conf             # Configuration Sqitch
├── sqitch.plan             # Plan de migration Sqitch
└── run-migrations.sh       # Script d'exécution des migrations
```

## Utilisation

### Avec Docker Compose

Les migrations sont automatiquement exécutées au démarrage via le service `sqitch` dans docker-compose.yml.

### En développement local

1. Assurez-vous d'avoir Sqitch installé :
```bash
# Sur Ubuntu/Debian
sudo apt-get install sqitch libdbd-pg-perl

# Sur macOS
brew install sqitch

# Avec Docker (recommandé pour éviter l'installation)
docker run --rm -v $(pwd)/migrations:/migrations sqitch/sqitch:latest
```

2. Démarrer PostgreSQL (si pas déjà fait) :
```bash
cd ..
docker-compose up -d postgres
```

3. Créer un fichier `.env` dans le dossier `migrations/` (copier depuis `.env.example`) :
```bash
cd migrations
cp .env.example .env
# Éditer .env si nécessaire
```

4. Exécuter les migrations :
```bash
./run-migrations.sh
```

Ou manuellement avec les variables d'environnement :
```bash
export DB_USER=horse_user
export DB_PASSWORD=horse_password
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=equilife_db
sqitch deploy db:pg://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

## Commandes Sqitch

### Déployer les migrations
```bash
sqitch deploy db:pg://user:password@host:port/database
```

### Vérifier l'état
```bash
sqitch status db:pg://user:password@host:port/database
```

### Vérifier l'intégrité
```bash
sqitch verify db:pg://user:password@host:port/database
```

### Revenir en arrière (revert)
```bash
sqitch revert db:pg://user:password@host:port/database
```

### Revenir en arrière d'une migration spécifique
```bash
sqitch revert --to migration_name db:pg://user:password@host:port/database
```

## Créer une nouvelle migration

1. Créer un nouveau changement :
```bash
cd migrations
sqitch add nom_de_la_migration --note "Description de la migration"
```

Cela crée la structure :
```
migrations/
└── nom_de_la_migration/
    ├── deploy/
    │   └── nom_de_la_migration.sql
    ├── revert/
    │   └── nom_de_la_migration.sql
    └── verify/
        └── nom_de_la_migration.sql
```

2. Éditer les fichiers SQL :
   - `deploy/nom_de_la_migration.sql` : Code SQL pour appliquer la migration
   - `revert/nom_de_la_migration.sql` : Code SQL pour annuler la migration
   - `verify/nom_de_la_migration.sql` : Code SQL pour vérifier que la migration a été appliquée

3. Ajouter la migration au plan :
Le fichier `sqitch.plan` est automatiquement mis à jour.

## Bonnes pratiques

- Toujours créer les scripts `deploy`, `revert` et `verify`
- Tester les migrations en local avant de les déployer
- Utiliser des noms de migrations descriptifs
- Documenter les changements dans le message de commit
- Ne jamais modifier une migration déjà déployée (créer une nouvelle migration à la place)

