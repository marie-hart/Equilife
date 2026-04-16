#!/bin/sh
# Exécute les migrations SQL avec psql (sans Sqitch).
# Utilisez ce script si Sqitch ne fonctionne pas (ex. erreur Perl).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

export PGUSER="${DB_USER:-horse_user}"
export PGPASSWORD="${DB_PASSWORD:-horse_password}"
export PGHOST="${DB_HOST:-localhost}"
export PGPORT="${DB_PORT:-5432}"
export PGDATABASE="${DB_NAME:-equilife_db}"

echo "═══════════════════════════════════════════════════════════"
echo "  Migrations SQL (psql)"
echo "═══════════════════════════════════════════════════════════"
echo "Host:     ${PGHOST}:${PGPORT}"
echo "Database: ${PGDATABASE}"
echo "User:     ${PGUSER}"
echo "═══════════════════════════════════════════════════════════"
echo ""

if ! PGPASSWORD="${PGPASSWORD}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Impossible de se connecter à PostgreSQL. Vérifiez le serveur et les variables (DB_*)."
    exit 1
fi
echo "✓ Connexion réussie"
echo ""

for sql in deploy/init.sql deploy/horses_links.sql deploy/rations_table.sql deploy/care_history.sql deploy/care_categories.sql deploy/products_name_per_user.sql deploy/quick_notes_by_horse.sql deploy/care_types.sql; do
    if [ ! -f "$sql" ]; then
        echo "⚠️ Fichier manquant: $sql"
        continue
    fi
    echo "→ $sql"
    PGPASSWORD="${PGPASSWORD}" psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -v ON_ERROR_STOP=1 -f "$sql" || exit 1
done

echo ""
echo "✓ Migrations terminées."
