#!/bin/sh
# Script pour exécuter les migrations Sqitch

# Charger les variables d'environnement depuis .env si présent (depuis le dossier migrations ou parent)
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

export PGUSER="${DB_USER:-horse_user}"
export PGPASSWORD="${DB_PASSWORD:-horse_password}"
export PGHOST="${DB_HOST:-localhost}"
export PGPORT="${DB_PORT:-5432}"
export PGDATABASE="${DB_NAME:-horse_care_db}"

echo "═══════════════════════════════════════════════════════════"
echo "  Exécution des migrations Sqitch"
echo "═══════════════════════════════════════════════════════════"
echo "Host:     ${PGHOST}:${PGPORT}"
echo "Database: ${PGDATABASE}"
echo "User:     ${PGUSER}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier si psql est disponible pour tester la connexion
if command -v psql > /dev/null 2>&1; then
    echo "Vérification de la connexion à PostgreSQL..."
    if ! PGPASSWORD="${PGPASSWORD}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -c "SELECT 1;" > /dev/null 2>&1; then
        echo ""
        echo "❌ Erreur: Impossible de se connecter à PostgreSQL"
        echo ""
        echo "Solutions possibles:"
        echo "  1. Démarrer PostgreSQL avec Docker:"
        echo "     cd .. && docker-compose up -d postgres"
        echo ""
        echo "  2. Vérifier les variables d'environnement:"
        echo "     DB_HOST=${PGHOST}"
        echo "     DB_PORT=${PGPORT}"
        echo "     DB_NAME=${PGDATABASE}"
        echo "     DB_USER=${PGUSER}"
        echo "     DB_PASSWORD=${PGPASSWORD}"
        echo ""
        echo "  3. Créer un fichier .env dans migrations/ avec:"
        echo "     DB_HOST=localhost"
        echo "     DB_PORT=5432"
        echo "     DB_NAME=horse_care_db"
        echo "     DB_USER=horse_user"
        echo "     DB_PASSWORD=horse_password"
        exit 1
    fi
    echo "✓ Connexion réussie"
    echo ""
fi

echo "Exécution de Sqitch..."
sqitch deploy db:pg://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}

