# Changelog

Toutes les modifications notables de ce projet seront documentees dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhere a [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

## [1.1.0] - 2026-04-17

### Added
- Page Mentions legales, Politique de confidentialite, et CGU.
- Route publiques `/legal-notice`, `/privacy-policy`, `/terms-of-use`.
- Liens vers les pages legales depuis Login, Register et Mon compte.
- Blocage de suppression des types de soin personnalises deja utilises.
- Migration Sqitch `care_types_is_favorite`.

### Changed
- Categories de soins repliees par defaut dans le formulaire.
- Palette de couleurs des tags categories dans l'onglet Sante.
- `care_history` rendu idempotent (`IF NOT EXISTS`) pour les deploiements prod.

## [1.0.0] - 2026-04-17

### Added
- Premiere base stable de l'application EquiLife (soins, activites, alimentation, produits, rappels, documents).

