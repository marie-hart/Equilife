#!/bin/sh
# Crée la base equilife_db et exécute les migrations.
# Utilise Docker si le conteneur postgres existe, sinon psql local.

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
echo "  Création de equilife_db et exécution des migrations"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Détecter le conteneur Docker postgres
CONTAINER=""
for name in equilife_postgres horse_care_postgres postgres; do
    if docker ps -q -f name="$name" 2>/dev/null | grep -q .; then
        CONTAINER="$name"
        break
    fi
done

if [ -n "$CONTAINER" ]; then
    echo "→ Création de la base $PGDATABASE (Docker: $CONTAINER)..."
    if docker exec "$CONTAINER" psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$PGDATABASE'" | grep -q 1; then
        echo "  (base déjà existante)"
    else
        docker exec "$CONTAINER" psql -U postgres -c "CREATE DATABASE $PGDATABASE OWNER $PGUSER;"
        echo "✓ Base créée"
    fi
else
    echo "→ Création de la base $PGDATABASE (psql local)..."
    if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$PGDATABASE'" 2>/dev/null | grep -q 1; then
        echo "  (base déjà existante)"
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U postgres -c "CREATE DATABASE $PGDATABASE OWNER $PGUSER;" || \
        PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE DATABASE $PGDATABASE;" || true
        echo "✓ Base créée"
    fi
fi

echo ""
echo "→ Exécution des migrations SQL..."
echo ""
sh run-migrations-psql.sh
