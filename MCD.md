Modèle Conceptuel de Données (MCD) - Application Horse Care
Vue d'ensemble
Le Modèle Conceptuel de Données décrit les entités principales de l'application et leurs relations. Le modèle a évolué d'une gestion simple de listes vers un système centralisé autour du cheval.

Entités Principales
1. CHEVAL (HORSE)
L'entité centrale de l'application.

id (UUID, PK)

nom (name) : Obligatoire.

race (breed), date_naissance (birth_date).

2. PRODUIT (PRODUCT)
Représente l'inventaire (consommables et matériel).

id (UUID, PK)

nom, marque (brand).

categorie : Granulés, Complément, Friandises, Équipement, Pharmacie, Autres.

suivi_stock : purchase_date, quantity_purchased, daily_usage, unit (kg, g, L).

besoin_rachat (needs_repurchase) : Booléen.

3. ÉVÉNEMENT (EVENT)
Soins, activités et rappels.

id (UUID, PK)

type : Soin ou Activité.

date_evenement, rappel_active.

product_id (FK) : Produit utilisé pendant le soin.

horse_id (FK) : Cheval concerné.

4. RATION
Plan alimentaire structuré.

id (UUID, PK)

nom (ex: "Ration Hiver"), actif (is_active).

horse_id (FK).

Relations et Cardinalités
CHEVAL ↔ ÉVÉNEMENT (1:N) : Un cheval peut avoir plusieurs événements, un événement appartient à un seul cheval.

CHEVAL ↔ RATION (1:N) : Un cheval peut avoir plusieurs plans de rations (un seul actif), une ration appartient à un cheval.

CHEVAL ↔ PRODUIT (N:N) : Via la table de liaison product_horses. Un produit peut servir à plusieurs chevaux (ex: un sac de granulés partagé), et un cheval utilise plusieurs produits.

RATION ↔ PRODUIT (N:N) : Via ration_items. Une ration contient plusieurs produits (ingrédients), et un produit peut entrer dans plusieurs rations.

ÉVÉNEMENT ↔ PRODUIT (N:1) : Un événement de soin peut consommer un produit (ex: application d'une pommade).

erDiagram
    HORSE ||--o{ EVENT : "reçoit"
    HORSE ||--o{ RATION : "consomme"
    HORSE }o--o{ PRODUCT : "utilise (via product_horses)"
    
    RATION ||--|{ RATION_ITEM : "contient"
    PRODUCT ||--o{ RATION_ITEM : "est ingrédient de"
    
    PRODUCT ||--o{ EVENT : "est utilisé pour"

    HORSE {
        uuid id PK
        string name
        string breed
        date birth_date
    }

    PRODUCT {
        uuid id PK
        string name
        string category
        decimal quantity_purchased
        string unit
        decimal daily_usage
        boolean needs_repurchase
    }

    EVENT {
        uuid id PK
        string name
        date event_date
        uuid horse_id FK
        uuid product_id FK
    }

    RATION {
        uuid id PK
        string name
        boolean is_active
        uuid horse_id FK
    }

    RATION_ITEM {
        uuid id PK
        uuid ration_id FK
        uuid product_id FK
        string quantity
        string[] frequency
    }