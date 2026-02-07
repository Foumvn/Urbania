# 📄 Rapport de Déploiement Final - Urbania

Ce rapport documente le processus de déploiement réussi du projet Urbania sur **Render**, les défis techniques rencontrés et les solutions mises en place.

## 🚀 État Actuel
- **Backend** : Opérationnel sur Render (Web Service) avec synchronisation de base de données.
- **Frontend** : Opérationnel sur Render (Static Site) communiquant avec le backend via des URLs absolues.
- **Base de Données** : PostgreSQL Render (Migration réussie depuis MongoDB).

---

## 🛠️ Problèmes Rencontrés & Solutions

### 1. Incompatibilité Python 3.13 (Erreur `cgi`)
- **Problème** : Render utilisait par défaut Python 3.13. Cette version a supprimé le module standard `cgi` (depuis PEP 594), provoquant un crash immédiat de Django.
- **Solution** : 
    - Création d'un fichier `runtime.txt` à la racine et dans `/backend` spécifiant `python-3.10.14`.
    - Configuration de la variable d'environnement `PYTHON_VERSION=3.10.14` sur Render.

### 2. Migration de la Base de Données (MongoDB ➔ PostgreSQL)
- **Problème** : L'utilisation de MongoDB avec `djongo` s'est avérée complexe et instable lors du déploiement sur Render (problèmes de connectivité et de drivers).
- **Solution** : 
    - Passage à **PostgreSQL** (natif et recommandé pour Django sur Render).
    - Utilisation de `dj-database-url` pour configurer dynamiquement la connexion via la variable `DATABASE_URL`.
    - Mise à jour du `requirements.txt` pour inclure `psycopg2-binary`.

### 3. Erreur Register "Unexpected end of JSON input"
- **Problème** : Lors de l'inscription, le frontend recevait une erreur JSON. Deux causes ont été identifiées :
    1. **Tables manquantes** : Les migrations n'avaient pas été appliquées sur la nouvelle base PostgreSQL.
    2. **Chemins API relatifs** : Le frontend essayait de contacter `/api/...` sur son propre domaine (statique) au lieu de l'URL absolue du backend.
- **Solution** : 
    - Ajout de `python manage.py migrate` dans la commande de build Render.
    - Généralisation de `API_BASE` dans tout le code frontend (React) en utilisant `import.meta.env.VITE_API_URL`.

### 4. Blocage du Build Frontend (Doublons)
- **Problème** : Le build Vite échouait à cause d'une erreur de syntaxe : `Duplicate key "piecesJointes" in object literal` dans `FormContext.jsx`.
- **Solution** : Nettoyage de l'état initial dans le contexte React pour supprimer les clés en doublon.

---

## 📖 Guide de Maintenance Rapide

### Commandes Render (Backend)
- **Build Command** : 
  `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- **Start Command** : 
  `gunicorn urbania_backend.wsgi:application`

### Variables d'Environnement Vitales
| Variable | Service | Rôle |
| :--- | :--- | :--- |
| `DATABASE_URL` | Backend | Connexion PostgreSQL |
| `VITE_API_URL` | Frontend | Lien vers le backend (ex: `https://.../api`) |
| `RENDER_EXTERNAL_URL` | Backend | URL pour le script Keep-Alive (anti-sommeil) |

---

## 💡 Conseils pour le Futur
- **Migrations** : Toujours inclure `python manage.py migrate` dans votre Build Command pour que votre base de données se mette à jour automatiquement à chaque déploiement.
- **CORS** : Si vous changez de domaine, assurez-vous de mettre à jour `ALLOWED_HOSTS` et `CORS_ALLOWED_ORIGINS` dans `settings.py`.
- **Keep-Alive** : Le script `backend/utils/keep_alive.py` s'occupe de réveiller votre serveur toutes les 14 minutes pour éviter la mise en veille de l'offre gratuite.

**Félicitations pour votre déploiement réussi ! Urbania est maintenant en ligne et prêt à l'emploi.** 🥂
