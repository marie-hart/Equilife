#!/bin/sh
# Copie les certificats localhost dans certs/ pour le proxy API (dev local)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CERTS_DIR="$ROOT_DIR/certs"
mkdir -p "$CERTS_DIR"
if [ -f "$ROOT_DIR/back/localhost+1.pem" ]; then
    cp "$ROOT_DIR/back/localhost+1.pem" "$CERTS_DIR/cert.pem"
    cp "$ROOT_DIR/back/localhost+1-key.pem" "$CERTS_DIR/key.pem"
    echo "✓ Certificats copiés dans certs/"
    echo "  API HTTPS : https://localhost:3443"
else
    echo "❌ Fichiers back/localhost+1.pem introuvables."
    echo "   Générez des certificats ou utilisez ceux de front/"
    exit 1
fi
