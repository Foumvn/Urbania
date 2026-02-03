# Guide de Déploiement Render - Urbania

Ce projet est prêt à être déployé sur **Render**. Voici les étapes à suivre :

## 1. État du Dépôt Git
C'est fait ! J'ai déjà initialisé le dépôt et poussé votre code sur GitHub :
**URL** : `https://github.com/Foumvn/Urbania.git` (Branche `master`)

Vous pouvez maintenant passer directement à l'étape du déploiement sur Render.

## 2. Déploiement du Backend (Web Service)
Créez un **Web Service** sur Render :
- **Runtime** : `Python 3`
- **Build Command** : `pip install -r backend/requirements.txt && python backend/manage.py collectstatic --noinput`
- **Start Command** : `gunicorn --chdir backend urbania_backend.wsgi:application`

### Variables d'environnement importantes :
| Clé | Valeur suggérée |
|-----|-----------------|
| `SECRET_KEY` | (Générez une clé complexe) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `votre-backend.onrender.com` |
| `MONGODB_HOST` | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `RENDER_EXTERNAL_URL` | `https://votre-backend.onrender.com` (Indispensable pour le Keep-Alive) |
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
