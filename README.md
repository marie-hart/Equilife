# Equilife 🐴

Application de gestion globale pour propriétaires et gestionnaires d'écuries, permettant de centraliser les soins, l'alimentation et l'inventaire.

## Fonctionnalités

Multi-chevaux : Profils détaillés pour chaque cheval.

Gestion des Produits & Stocks : Suivi des consommables (granulés, compléments) avec calcul automatique des besoins de rachat.

Plan Alimentaire (Rations) : Configuration de rations personnalisées par cheval liées à l'inventaire des produits.

Suivi des Soins (Events) : Historique des interventions (vétérinaire, ostéo, parage) avec rappels intelligents.

Gestion Documentaire : Centralisation des factures, certificats et ordonnances par cheval.

## Technologies

Backend : Node.js 20+, TypeScript, Express

Base de données : PostgreSQL 15 (Alpine)

Migrations : Sqitch

Containerisation : Docker & Docker Compose

Cache : Redis (pour les sessions et calculs de stock)

## Structure du projet
```
equilife-app/
├── back/              # API Express en TypeScript
│   ├── src/           # Modèles, Contrôleurs, Services
│   └── Dockerfile
├── migrations/       # Gestion du schéma SQL (Sqitch)
│   ├── deploy/       # Scripts de création
│   ├── revert/       # Scripts d'annulation
│   ├── verify/       # Tests de schéma
│   ├── sqitch.plan   # Chef d'orchestre des migrations
│   └── run-migrations.sh
└── docker-compose.yml
```

## Installation Rapide

### Prérequis
Docker Desktop ou Docker Engine

Node.js 20 (pour le dev local)

### Dev local (API + frontend sans Docker)

À la racine du dépôt : `npm install` puis **`npm run dev`** — lance l’API (`back`, HTTP sur le port du `back/.env`, souvent 3001) et Vite (`front`, https://localhost:5173). Le proxy Vite envoie `/api` vers cette API ; les deux processus doivent tourner (d’où ce script). Pour HTTPS sur l’API en dev uniquement : `DEV_HTTPS=true` dans `back/.env` et certificats `localhost-key.pem` / `localhost.pem` dans `back/`.

### Démarrage Express
```Bash
# 1. Lancer l'infrastructure (DB + Redis + API)
docker-compose up -d

# 2. Créer la base equilife_db et exécuter les migrations
cd migrations
./create-and-migrate.sh
# Ou manuellement : ./run-migrations.sh (si equilife_db existe déjà)
```

L'API est maintenant accessible sur http://localhost:3000.

**Production :** Créer un `.env` à la racine avec `DB_PASSWORD` et `CORS_ORIGIN` obligatoires. Voir `docs/DEPLOYMENT.md` pour la checklist complète.

### Authentification (e-mail / mot de passe)

L’app et l’API sont prévues pour une **connexion par compte utilisateur** (e-mail + mot de passe, hachage bcrypt). Définir dans `back/.env` :

```bash
USER_AUTH_ENABLED=true
JWT_SECRET=secret_long_aleatoire_min_32_caracteres
```

Sans ces variables, l’API peut fonctionner en mode ouvert (développement uniquement). Voir `docs/SECURITY.md` pour les détails.

### API en HTTPS (reverse proxy)

Pour servir l’API en HTTPS avec en-têtes de sécurité :

```bash
./scripts/setup-api-certs.sh   # Copier les certificats dev
docker-compose up -d api-proxy backend
```

L’API est accessible sur https://localhost:3443.

### En-têtes de sécurité

Les en-têtes de sécurité sont configurés pour le backend (helmet + proxy) et le frontend. Voir `docs/SECURITY_HEADERS.md`.