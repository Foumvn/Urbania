# Guide de Déploiement Render - Urbania

Ce projet est prêt à être déployé sur **Render**. Voici les étapes à suivre :

## 1. État du Dépôt Git
C'est fait ! J'ai déjà initialisé le dépôt et poussé votre code sur GitHub :
**URL** : `https://github.com/Foumvn/Urbania.git` (Branche `master`)

Vous pouvez maintenant passer directement à l'étape du déploiement sur Render.

## 2. Déploiement du Backend (Web Service)
Créez un **Web Service** sur Render :
- **Runtime** : `Python 3`
- **Build Command** : `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- **Start Command** : `gunicorn urbania_backend.wsgi:application`

### Configuration de la Base de Données (PostgreSQL)
1. Sur Render, cliquez sur **"New"** -> **"PostgreSQL"**.
2. Nommez-la `urbania-db` et créez-la (offre Free).
3. Une fois créée, copiez l' **"Internal Database URL"**.

### Variables d'environnement importantes :
| Clé | Valeur suggérée |
|-----|-----------------|
| `DATABASE_URL` | (Collez l'URL de votre base PostgreSQL Render) |
| `SECRET_KEY` | (Générez une clé complexe) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*` |
| `RENDER_EXTERNAL_URL` | `https://votre-backend.onrender.com` |
| `RENDER` | `true` |

## 3. Déploiement du Frontend (Static Site)
Créez un **Static Site** sur Render :
- **Build Command** : `npm install && npm run build` (Exécuté dans `frontend/`)
- **Publish Directory** : `frontend/dist`

### Variables d'environnement :
| Clé | Valeur |
|-----|--------|
| `VITE_API_URL` | `https://votre-backend.onrender.com/api` |

---

## ℹ️ À propos du Keep-Alive
J'ai intégré une boucle automatique dans `backend/utils/keep_alive.py`. Si vous renseignez `RENDER_EXTERNAL_URL`, le serveur s'auto-pinguera toutes les 14 minutes pour empêcher la mise en veille de Render (Free Tier).
