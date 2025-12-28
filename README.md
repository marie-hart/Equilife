# Horse Care App

Application de gestion quotidienne pour propriétaires de chevaux.

## Fonctionnalités

- **Suivi des événements** : Gestion des événements récurrents (dentiste, parage, etc.) avec système de rappels
- **Gestion du matériel** : Liste du matériel à acheter régulièrement avec suivi des dates d'achat

## Technologies

- **Backend** : Node.js, TypeScript, Express
- **Base de données** : PostgreSQL
- **Cache** : Redis
- **Migrations** : Sqitch
- **Containerisation** : Docker, Docker Compose

## Structure du projet

```
horse-care-app/
├── back/              # Code backend
│   ├── src/          # Code source TypeScript
│   ├── dist/         # Code compilé (généré)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── migrations/       # Migrations Sqitch
│   ├── init/
│   │   ├── deploy/
│   │   ├── revert/
│   │   └── verify/
│   ├── sqitch.conf
│   ├── sqitch.plan
│   └── run-migrations.sh
└── docker-compose.yml
```

## Installation

### Prérequis

- Docker et Docker Compose installés
- Sqitch (pour les migrations locales)
- Node.js 20+ (pour le développement local)

### Démarrage avec Docker

1. Cloner le projet

2. Démarrer les services :

```bash
docker-compose up -d
```

Cela démarre :

- PostgreSQL sur le port 5432
- Exécute les migrations Sqitch
- L'API backend sur le port 3000

### Développement local

1. Installer les dépendances du backend :

```bash
cd back
npm install
```

2. Démarrer PostgreSQL (via Docker) :

```bash
docker-compose up -d postgres
```

3. Créer un fichier `.env` dans le dossier `back/` :

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=horse_care_db
DB_USER=horse_user
DB_PASSWORD=horse_password
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
```

4. Exécuter les migrations Sqitch :

```bash
cd migrations
export DB_USER=horse_user
export DB_PASSWORD=horse_password
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=horse_care_db
sqitch deploy db:pg://horse_user:horse_password@localhost:5432/horse_care_db
```

Ou utiliser le script :

```bash
cd migrations
./run-migrations.sh
```

5. Démarrer le serveur de développement :

```bash
cd back
npm run dev
```

## Migrations avec Sqitch

### Commandes Sqitch utiles

- Déployer toutes les migrations :

```bash
sqitch deploy db:pg://user:password@host:port/database
```

- Vérifier l'état des migrations :

```bash
sqitch status db:pg://user:password@host:port/database
```

- Revenir en arrière (revert) :

```bash
sqitch revert db:pg://user:password@host:port/database
```

- Vérifier les migrations :

```bash
sqitch verify db:pg://user:password@host:port/database
```

### Créer une nouvelle migration

1. Créer un nouveau changement :

```bash
cd migrations
sqitch add nom_de_la_migration --note "Description de la migration"
```

2. Ajouter le SQL dans :
   - `migrations/nom_de_la_migration/deploy/nom_de_la_migration.sql`
   - `migrations/nom_de_la_migration/revert/nom_de_la_migration.sql`
   - `migrations/nom_de_la_migration/verify/nom_de_la_migration.sql`

## API Endpoints

### Événements

- `GET /api/events` - Liste tous les événements
- `GET /api/events/reminders` - Liste les événements avec rappels à venir
- `GET /api/events/:id` - Récupère un événement par ID
- `POST /api/events` - Crée un nouvel événement
- `PUT /api/events/:id` - Met à jour un événement
- `DELETE /api/events/:id` - Supprime un événement

### Matériel

- `GET /api/materials` - Liste tous les matériels actifs
- `GET /api/materials/due-for-purchase` - Liste les matériels à acheter
- `GET /api/materials/:id` - Récupère un matériel par ID
- `POST /api/materials` - Crée un nouveau matériel
- `PUT /api/materials/:id` - Met à jour un matériel
- `DELETE /api/materials/:id` - Désactive un matériel
- `POST /api/materials/:id/purchase` - Marque un matériel comme acheté

## Structure de la base de données

### Table `events`

- `id` (UUID) - Identifiant unique
- `name` (VARCHAR) - Nom de l'événement
- `description` (TEXT) - Description
- `event_date` (DATE) - Date de l'événement
- `reminder_enabled` (BOOLEAN) - Rappel activé
- `reminder_interval_months` (INTEGER) - Intervalle de rappel en mois
- `reminder_interval_years` (INTEGER) - Intervalle de rappel en années
- `last_reminder_date` (DATE) - Dernière date de rappel
- `next_reminder_date` (DATE) - Prochaine date de rappel
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### Table `materials`

- `id` (UUID) - Identifiant unique
- `name` (VARCHAR) - Nom du matériel
- `description` (TEXT) - Description
- `last_purchase_date` (DATE) - Dernière date d'achat
- `purchase_interval_months` (INTEGER) - Intervalle d'achat en mois
- `purchase_interval_years` (INTEGER) - Intervalle d'achat en années
- `estimated_cost` (DECIMAL) - Coût estimé
- `is_active` (BOOLEAN) - Matériel actif
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour
