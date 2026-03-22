# Horse Care App 🐴

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

**Production :** `DB_PASSWORD` et `CORS_ORIGIN` sont obligatoires dans `back/.env`. `CORS_ORIGIN` doit contenir l’origine du frontend (ex: `https://app.equilife.com`).

### Authentification (optionnelle)

Par défaut, l'app fonctionne **sans mot de passe**.

Pour activer l'authentification par PIN, définir dans `back/.env` :
```bash
AUTH_ENABLED=true
JWT_SECRET=secret_long_aleatoire_min_32_caracteres
APP_PIN=1234
```
Le frontend affichera un écran de connexion.

Voir `docs/SECURITY.md` pour les détails.

### API en HTTPS (reverse proxy)

Pour servir l’API en HTTPS avec en-têtes de sécurité :

```bash
./scripts/setup-api-certs.sh   # Copier les certificats dev
docker-compose up -d api-proxy backend
```

L’API est accessible sur https://localhost:3443.

### En-têtes de sécurité

Les en-têtes de sécurité sont configurés pour le backend (helmet + proxy) et le frontend. Voir `docs/SECURITY_HEADERS.md`.