# Equilife — Frontend

Frontend de l'application de gestion quotidienne pour propriétaires de chevaux.

## Technologies

- **Vue.js 3** avec Composition API
- **TypeScript**
- **Vite** (build tool)
- **Vue Router** (routage)
- **Axios** (requêtes HTTP)

## Installation

```bash
yarn install
```

## Développement

```bash
yarn dev
```

Le serveur de développement démarre sur `http://localhost:5173`

### Configuration API

Par défaut, les requêtes partent vers `/api` (proxy Vite).
Vous pouvez surcharger l'URL via la variable `VITE_API_BASE_URL`
ex: `VITE_API_BASE_URL=http://localhost:3000/api`.

## Build

```bash
yarn build
```

## Vérification TypeScript

```bash
yarn type-check
```

## Design

Interface minimaliste inspirée santé + équin :

- Fond gris très clair (#F2F2F2)
- Cartes avec bordures fines arrondies
- Icônes simples, outline bleu nuit
- Boutons principaux turquoise (#2AB4C8)
- Boutons secondaires beige sable (#D8C7A8)
