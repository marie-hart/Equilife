# Certificats SSL pour le reverse proxy API

Placez ici les certificats SSL pour servir l'API en HTTPS :

- `cert.pem` — certificat (ou fullchain)
- `key.pem` — clé privée

## Développement local

Pour utiliser les certificats localhost existants :

```bash
mkdir -p certs
cp back/localhost+1.pem certs/cert.pem
cp back/localhost+1-key.pem certs/key.pem
```

## Production (Let's Encrypt)

```bash
# Avec certbot
sudo certbot certonly --standalone -d api.votredomaine.com
sudo cp /etc/letsencrypt/live/api.votredomaine.com/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/api.votredomaine.com/privkey.pem certs/key.pem
```

Le proxy API sera accessible sur https://localhost:3443 (ou votre domaine).
