# Exemples d'utilisation de l'API

## Événements

### Créer un événement avec rappel

```bash
POST /api/events
Content-Type: application/json

{
  "name": "Visite dentiste",
  "description": "Contrôle dentaire annuel",
  "event_date": "2024-01-15",
  "reminder_enabled": true,
  "reminder_interval_years": 1
}
```

### Créer un événement avec rappel tous les 6 mois

```bash
POST /api/events
Content-Type: application/json

{
  "name": "Parage",
  "description": "Parage des sabots",
  "event_date": "2024-01-10",
  "reminder_enabled": true,
  "reminder_interval_months": 6
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

## Matériel

### Créer un matériel avec intervalle d'achat

```bash
POST /api/materials
Content-Type: application/json

{
  "name": "Aliment complémentaire",
  "description": "Complément vitaminé",
  "last_purchase_date": "2023-12-01",
  "purchase_interval_months": 2,
  "estimated_cost": 45.50
}
```

### Créer un matériel annuel

```bash
POST /api/materials
Content-Type: application/json

{
  "name": "Couverture d'hiver",
  "description": "Couverture imperméable",
  "last_purchase_date": "2023-10-01",
  "purchase_interval_years": 1,
  "estimated_cost": 120.00
}
```

### Récupérer tous les matériels actifs

```bash
GET /api/materials
```

### Récupérer les matériels à acheter

```bash
GET /api/materials/due-for-purchase
```

### Marquer un matériel comme acheté

```bash
POST /api/materials/{id}/purchase
Content-Type: application/json

{
  "purchaseDate": "2024-01-20"
}
```

### Désactiver un matériel

```bash
PUT /api/materials/{id}
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

### Lister tous les matériels

```bash
curl http://localhost:3000/api/materials
```

### Récupérer les matériels à acheter

```bash
curl http://localhost:3000/api/materials/due-for-purchase
```
