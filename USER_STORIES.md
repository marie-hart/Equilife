# User Stories - Application de Gestion de Soins Équin

## Vue d'ensemble

Application web permettant aux propriétaires de chevaux de gérer quotidiennement les soins de leurs chevaux, notamment les événements récurrents (dentiste, parage, etc.) et l'achat de matériel.

## Acteurs

- **Propriétaire de chevaux** : Utilisateur principal de l'application

---

## User Stories - Gestion des Événements

### US-01 : Créer un événement

**En tant que** propriétaire de chevaux  
**Je veux** créer un nouvel événement (visite dentiste, parage, vaccination, etc.)  
**Afin de** suivre les soins récurrents de mes chevaux

**Critères d'acceptation :**

- Je peux saisir un nom d'événement (obligatoire)
- Je peux ajouter une description (optionnelle)
- Je dois renseigner une date d'événement (obligatoire)
- L'événement est créé avec une date de création automatique
- Je peux activer/désactiver un système de rappel lors de la création

### US-02 : Configurer un rappel récurrent pour un événement

**En tant que** propriétaire de chevaux  
**Je veux** configurer un intervalle de rappel (en mois ou années) pour un événement  
**Afin de** être averti automatiquement quand je dois planifier la prochaine occurrence

**Critères d'acceptation :**

- Je peux activer les rappels pour un événement
- Je peux définir un intervalle en mois (ex: 6 mois pour un parage)
- Je peux définir un intervalle en années (ex: 1 an pour un contrôle dentaire)
- Le système calcule automatiquement la prochaine date de rappel
- La dernière date de rappel peut être enregistrée

### US-03 : Consulter la liste de tous les événements

**En tant que** propriétaire de chevaux  
**Je veux** voir la liste de tous mes événements  
**Afin de** avoir une vue d'ensemble de tous les soins planifiés

**Critères d'acceptation :**

- La liste affiche tous les événements triés par date (plus récents en premier)
- Pour chaque événement, je vois le nom, la date, la description
- Je peux voir si un rappel est activé ou non
- Les données sont mises en cache pour améliorer les performances

### US-04 : Consulter un événement spécifique

**En tant que** propriétaire de chevaux  
**Je veux** consulter les détails d'un événement spécifique  
**Afin de** voir toutes les informations associées

**Critères d'acceptation :**

- Je peux accéder à un événement par son identifiant unique
- Toutes les informations de l'événement sont affichées (nom, description, date, rappels, etc.)

### US-05 : Voir les rappels à venir

**En tant que** propriétaire de chevaux  
**Je veux** voir la liste des événements avec des rappels à venir  
**Afin de** savoir quels soins je dois planifier prochainement

**Critères d'acceptation :**

- La liste affiche uniquement les événements avec rappels activés
- Les événements affichés ont une date de rappel future ou proche
- Pour chaque événement, je vois la prochaine date de rappel

### US-06 : Modifier un événement

**En tant que** propriétaire de chevaux  
**Je veux** modifier les informations d'un événement existant  
**Afin de** mettre à jour les informations si nécessaire (changement de date, modification des rappels, etc.)

**Critères d'acceptation :**

- Je peux modifier le nom de l'événement
- Je peux modifier la description
- Je peux modifier la date de l'événement
- Je peux activer/désactiver les rappels
- Je peux modifier l'intervalle de rappel (mois ou années)
- La date de mise à jour est automatiquement enregistrée

### US-07 : Supprimer un événement

**En tant que** propriétaire de chevaux  
**Je veux** supprimer un événement  
**Afin de** nettoyer ma liste si un événement n'est plus pertinent

**Critères d'acceptation :**

- Je peux supprimer un événement par son identifiant
- L'événement est définitivement supprimé de la base de données
- Un message de confirmation est retourné

---

## User Stories - Gestion du Matériel

### US-08 : Créer un matériel à acheter

**En tant que** propriétaire de chevaux  
**Je veux** ajouter un nouveau matériel à ma liste d'achats récurrents  
**Afin de** suivre les achats réguliers nécessaires (aliments, compléments, équipement, etc.)

**Critères d'acceptation :**

- Je peux saisir un nom de matériel (obligatoire)
- Je peux ajouter une description (optionnelle)
- Je peux renseigner la dernière date d'achat (optionnelle)
- Je peux définir un intervalle d'achat en mois ou années
- Je peux estimer le coût du matériel
- Le matériel est créé avec le statut "actif" par défaut

### US-09 : Consulter la liste des matériels

**En tant que** propriétaire de chevaux  
**Je veux** voir la liste de tous mes matériels  
**Afin de** avoir une vue d'ensemble de mes achats récurrents

**Critères d'acceptation :**

- La liste affiche par défaut uniquement les matériels actifs
- Je peux optionnellement voir aussi les matériels inactifs
- Pour chaque matériel, je vois le nom, la dernière date d'achat, l'intervalle d'achat, le coût estimé

### US-10 : Consulter un matériel spécifique

**En tant que** propriétaire de chevaux  
**Je veux** consulter les détails d'un matériel spécifique  
**Afin de** voir toutes les informations associées

**Critères d'acceptation :**

- Je peux accéder à un matériel par son identifiant unique
- Toutes les informations du matériel sont affichées

### US-11 : Voir les matériels à acheter

**En tant que** propriétaire de chevaux  
**Je veux** voir la liste des matériels qu'il est temps d'acheter  
**Afin de** planifier mes prochains achats

**Critères d'acceptation :**

- La liste affiche uniquement les matériels actifs
- Les matériels affichés ont dépassé leur intervalle d'achat (basé sur la dernière date d'achat)
- Pour chaque matériel, je vois quand il doit être acheté

### US-12 : Marquer un matériel comme acheté

**En tant que** propriétaire de chevaux  
**Je veux** marquer un matériel comme acheté avec une date  
**Afin de** mettre à jour la dernière date d'achat et réinitialiser le compteur

**Critères d'acceptation :**

- Je peux marquer un matériel comme acheté via son identifiant
- Je peux spécifier une date d'achat (si non spécifiée, la date actuelle est utilisée)
- La dernière date d'achat est mise à jour
- La prochaine date d'achat est recalculée automatiquement

### US-13 : Modifier un matériel

**En tant que** propriétaire de chevaux  
**Je veux** modifier les informations d'un matériel existant  
**Afin de** mettre à jour les informations si nécessaire (changement d'intervalle, de coût, etc.)

**Critères d'acceptation :**

- Je peux modifier le nom du matériel
- Je peux modifier la description
- Je peux modifier la dernière date d'achat
- Je peux modifier l'intervalle d'achat (mois ou années)
- Je peux modifier le coût estimé
- Je peux activer/désactiver le matériel (is_active)
- La date de mise à jour est automatiquement enregistrée

### US-14 : Désactiver un matériel

**En tant que** propriétaire de chevaux  
**Je veux** désactiver un matériel  
**Afin de** le retirer de ma liste active sans le supprimer définitivement (pour garder un historique)

**Critères d'acceptation :**

- Je peux désactiver un matériel en mettant is_active à false
- Le matériel n'apparaît plus dans les listes actives par défaut
- Le matériel est conservé dans la base de données
- Je peux le réactiver plus tard si nécessaire

---

## User Stories - Performance et Technique

### US-15 : Cache des données

**En tant que** système  
**Je veux** mettre en cache les données fréquemment consultées  
**Afin de** améliorer les performances et réduire la charge sur la base de données

**Critères d'acceptation :**

- Les listes d'événements sont mises en cache (TTL 5 minutes)
- Les événements individuels sont mis en cache (TTL 10 minutes)
- Le cache est invalidé lors des modifications (création, mise à jour, suppression)
- Redis est utilisé comme système de cache

---

## Priorisation (Exemple)

### Priorité Haute (MVP)

- US-01, US-03, US-05 (Gestion basique des événements)
- US-08, US-09, US-11 (Gestion basique du matériel)
- US-12 (Marquer comme acheté)

### Priorité Moyenne

- US-02 (Configuration des rappels)
- US-04, US-10 (Consultation détaillée)
- US-06, US-13 (Modification)
- US-07, US-14 (Suppression/Désactivation)

### Priorité Basse

- US-15 (Optimisations techniques)
