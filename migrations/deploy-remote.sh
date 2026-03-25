#!/usr/bin/env sh
# Déploie les migrations Sqitch vers une base distante (ex. Render PostgreSQL).
#
# 1. Copier l’« Internal Database URL » depuis Render (PostgreSQL → Connect).
# 2. Exporter puis lancer :
#    export DATABASE_URL='postgresql://user:pass@host:5432/dbname'
#    ./deploy-remote.sh
#
# Ne pas utiliser `sqitch deploy db:pg:$DATABASE_URL` tel quel : Sqitch attend
# une URI du type db:pg://user:pass@host:port/db (pas db:pg:postgresql://...).

set -e
cd "$(dirname "$0")"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL n’est pas défini."
    echo ""
    echo "Exemple (URL interne Render) :"
    echo '  export DATABASE_URL="postgresql://user:xxxx@dpg-xxxxx.frankfurt-postgres.render.com:5432/equilife_db"'
    echo "  ./deploy-remote.sh"
    exit 1
fi

# postgresql:// ou postgres:// → db:pg://user@host:port/db
REST="${DATABASE_URL#postgresql://}"
REST="${REST#postgres://}"
TARGET="db:pg://${REST}"

echo "→ sqitch deploy (base distante)"
sqitch deploy "$TARGET"
