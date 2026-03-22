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
horse-care-app/
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

# 2. Exécuter les migrations
cd migrations
./run-migrations.sh
```

L'API est maintenant accessible sur http://localhost:3000.