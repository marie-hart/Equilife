# Exemples d'utilisation de l'API

## Événements

### Créer un événement avec rappel

```bash
POST /api/events
Content-Type: application/json

{
  "name": "Soin musculaire",
  "description": "Application gel après séance",
  "event_date": "2024-02-21",
  "horse_id": "uuid-du-cheval",
  "product_id": "uuid-du-produit",
  "reminder_enabled": true,
  "reminder_interval_months": 1
}
```

### Créer un événement avec rappel tous les 6 mois

```bash
POST /api/events
Content-Type: application/json

{
  "name": "Balade forêt",
  "event_date": "2024-02-20",
  "horse_id": "uuid-du-cheval",
  "reminder_enabled": false
}
```

### Récupérer tous les événements

```bash
GET /api/events
```

### Récupérer les rappels à venir

```bash
GET /api/events/reminders
```

### Mettre à jour un événement

```bash
PUT /api/events/{id}
Content-Type: application/json

{
  "reminder_enabled": false
}
```

## Produit

### Créer un produit avec suivi de consommation

```bash
POST /api/products
Content-Type: application/json

{
  "name": "Granulés Performance",
  "brand": "EquiFeed",
  "category": "Granulés",
  "last_purchase_date": "2024-01-15",
  "quantity_purchased": 25.0,
  "unit": "kg",
  "daily_usage": 1.5,
  "note": "Acheté chez le fournisseur habituel"
}
```

### Créer un équipement

```bash
POST /api/products
Content-Type: application/json

{
  "name": "Couverture 200g",
  "category": "Équipement",
  "brand": "HorseWare",
  "needs_repurchase": false
}
```

### Récupérer tous les produits actifs

```bash
GET /api/products
```

### Récupérer les produits à acheter

```bash
GET /api/products/due-for-purchase
```

### Désactiver un produit

```bash
PUT /api/products/{id}
Content-Type: application/json

{
  "is_active": false
}
```

## Exemples avec curl

### Créer un événement

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vaccination",
    "event_date": "2024-03-01",
    "reminder_enabled": true,
    "reminder_interval_years": 1
  }'
```

### Lister tous les produits

```bash
curl http://localhost:3000/api/products
```

### Récupérer les produits à acheter

```bash
curl http://localhost:3000/api/products/due-for-purchase
```


## Rations

### Créer une ration pour un cheval

```bash
POST /api/rations
Content-Type: application/json

{
  "horse_id": "uuid-du-cheval",
  "name": "Ration Hiver",
  "start_date": "2024-11-01",
  "is_active": true
}
```

### Ajouter un aliment à une ration

```bash
POST /api/rations/{ration_id}/items
Content-Type: application/json

{
  "product_id": "uuid-du-produit",
  "quantity": "2",
  "unit": "L",
  "frequency": ["Matin", "Soir"],
  "type": "aliment"
}
```

## Exemple avec curl

### Mettre à jour le stock d'un produit

```bash
curl -X PUT http://localhost:3000/api/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "needs_repurchase": true,
    "note": "Rupture de stock imminente"
  }'
  ```
### Récupérer les événements d'un cheval spécifique

```bash
curl http://localhost:3000/api/events?horse_id={uuid}
```