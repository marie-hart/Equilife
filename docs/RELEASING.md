# Releasing et versionning

Ce document definit le minimum de versionning applique au projet EquiLife.

## 1) Regle de version

Le projet suit **SemVer** avec un tag Git prefixe par `v`.

- `MAJOR` (`v2.0.0`) : changements incompatibles.
- `MINOR` (`v1.4.0`) : nouvelles fonctionnalites retro-compatibles.
- `PATCH` (`v1.4.3`) : corrections sans impact de contrat.

La version de reference est `package.json` (racine), synchronisee avec:

- `front/package.json`
- `back/package.json`

## 2) Strategie de branches

- `main` = branche de production.
- Toute modification passe par **Pull Request** (pas de commit direct sur `main`).
- PR review obligatoire avant merge.

Recommandation GitHub:

- Branch protection activee sur `main`.
- Require pull request reviews before merging.
- Require status checks to pass (lint/tests/build).
- Restrict force pushes.

## 3) Changelog

Le fichier `CHANGELOG.md` doit etre mis a jour dans chaque PR avec:

- section `[Unreleased]`
- categories `Added`, `Changed`, `Fixed`, `Removed` selon besoin.

Au moment d'une release:

1. Renommer/dupliquer les points `[Unreleased]` vers la version cible (`[X.Y.Z] - YYYY-MM-DD`).
2. Re-creer une section vide `[Unreleased]`.

## 4) Procedure de release prod

Depuis une branche propre et a jour:

1. Mettre a jour les versions (`package.json` racine, `front`, `back`).
2. Mettre a jour `CHANGELOG.md`.
3. Merge sur `main` via PR.
4. Tagger la release:

```bash
npm run release:tag -- vX.Y.Z
git push origin vX.Y.Z
```

5. Deployer en production a partir du commit tagge.

## 5) Convention de messages

Conseille (simple):

- `feat:` nouvelle fonctionnalite
- `fix:` correction
- `chore:` taches techniques
- `docs:` documentation

Exemple:

- `feat: add legal pages and public routes`
- `fix: block deleting custom care types already in use`
