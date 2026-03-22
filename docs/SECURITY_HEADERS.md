# En-têtes de sécurité

## API (backend)

L’API utilise **helmet** (Express) pour les en-têtes de sécurité. En production, elle est servie en HTTPS via un **reverse proxy Nginx** (`nginx/api-proxy.conf`) qui ajoute notamment :

- X-Frame-Options
- X-Content-Type-Options  
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

**Utilisation :** voir `certs/README.md` pour configurer les certificats SSL, puis `docker-compose up -d api-proxy`. L’API est alors accessible sur https://localhost:3443.

---

## Frontend en production

Les en-têtes suivants sont configurés pour renforcer la sécurité du frontend :

| En-tête | Valeur | Rôle |
|---------|--------|------|
| X-Frame-Options | SAMEORIGIN | Empêche le chargement en iframe (clickjacking) |
| X-Content-Type-Options | nosniff | Empêche le MIME-sniffing |
| X-XSS-Protection | 1; mode=block | Protection XSS (navigateurs legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | Limite les informations du Referer |
| Permissions-Policy | (désactivé: caméra, géoloc, etc.) | Restreint les APIs navigateur |
| Content-Security-Policy | Voir ci-dessous | Contrôle des sources de contenu |

---

## Déploiements supportés

### 1. Nginx (Docker, VPS, serveur dédié)

Le dossier `nginx/` et `front/nginx.conf` contiennent la configuration. Pour Docker :

```bash
docker-compose up -d front
```

Le front est servi sur http://localhost:8080 avec les en-têtes de sécurité.

### 2. Netlify / Cloudflare Pages

Le fichier `front/public/_headers` est copié dans `dist/` lors du build. Netlify et Cloudflare Pages l’utilisent automatiquement.

### 3. Cloudflare (domaine en proxy)

Dans le dashboard Cloudflare : **Rules** → **Transform Rules** → **Modify response header**  
Ajouter les en-têtes listés ci-dessus.

### 4. Vercel

Créer `front/vercel.json` :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 5. Apache

Dans `.htaccess` ou la config virtuelle :

```apache
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

---

## HSTS (HTTPS)

Si le site est servi en HTTPS, ajouter :

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Attention** : une fois activé, le navigateur n’acceptera plus que du HTTPS pendant au moins 1 an.

---

## Content-Security-Policy (CSP)

La CSP actuelle autorise les sources nécessaires à une SPA Vue/Vite (inline scripts pour Vue, Google Fonts, etc.). Si vous intégrez d’autres services (analytics, cartes, etc.), adapter la directive `Content-Security-Policy` en conséquence.
