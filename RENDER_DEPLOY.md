# Guide de Déploiement Render - Urbania

Ce projet est prêt à être déployé sur **Render**. Voici les étapes à suivre :

## 1. État du Dépôt Git
Push du code sur GitHub :
1. Pousser les derniers changements :
```bash
git add .
git commit -m "Prepare for deployment: Firebase Auth + Google Sign-In"
git push origin master
```
(Assurez-vous que votre dépôt est à jour)

## 2. Déploiement du Backend (Web Service)

Créez un **Web Service** sur Render connecté à votre repo GitHub (`Urbania` ou sous-dossier `Urbania/backend` selon la structure de votre repo).
Si votre repo contient tout le projet, définissez le **Root Directory** à `Urbania/backend`.

- **Name** : `urbania-backend`
- **Region** : Frankfurt (ou proche de vous)
- **Runtime** : `Python 3`
- **Build Command** : `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput`
- **Start Command** : `gunicorn urbania_backend.wsgi:application`

### Configuration de la Base de Données (PostgreSQL) - Recommandé
1. Sur Render, cliquez sur **"New"** -> **"PostgreSQL"**.
2. Nommez-la `urbania-db` et créez-la (offre Free).
3. Une fois créée, copiez l' **"Internal Database URL"**.

### Fichiers Secrets (Pour Firebase)
L'authentification Google nécessite le fichier de service `firebase-credentials.json`.
1. Dans le dashboard de votre Web Service sur Render, allez dans **"Environment"** -> **"Secret Files"**.
2. Cliquez sur **"Add Secret File"**.
3. **Filename** : `firebase-credentials.json`
4. **Content** : Collez le contenu complet de votre fichier `urbaniaa-86d1f-firebase-adminsdk-fbsvc-886c2c07f3.json` local.
5. Sauvegardez. Le fichier sera accessible à la racine de votre application (`/opt/render/project/src/Urbania/backend/firebase-credentials.json` ou `./firebase-credentials.json`).

### Variables d'environnement Backend :
Ajoutez ces variables dans l'onglet **"Environment"** :

| Clé | Valeur suggérée |
|-----|-----------------|
| `DATABASE_URL` | (Collez l'Internal Database URL de PostgreSQL) |
| `SECRET_KEY` | (Générez une clé complexe, ex: `django-insecure-...`) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*` (ou votre domaine frontend) |
| `RENDER_EXTERNAL_URL` | `https://urbania-backend.onrender.com` (URL fournie par Render après création) |
| `RENDER` | `true` |
| `FIREBASE_CREDENTIALS_PATH` | `./firebase-credentials.json` |
| `GOOGLE_CLIENT_ID` | `100737257486873402762` (Votre ID Google) |
| `MISTRAL_API_KEY` | `VOTRE_ALE_API_KEY_MISTRAL` |
| `HUGGINGFACE_API_KEY` | `hf_VOTRE_TOKEN_ICI` |
| `IMAGE_PROVIDER` | `HUGGINGFACE` |

## 3. Déploiement du Frontend (Static Site)

Créez un **Static Site** sur Render :
- **Name** : `urbania-frontend`
- **Root Directory** : `Urbania/frontend`
- **Build Command** : `npm install && npm run build`
- **Publish Directory** : `dist`

### Variables d'environnement Frontend :
Ajoutez ces variables **avant** le premier déploiement/build :

| Clé | Valeur |
|-----|--------|
| `VITE_API_URL` | `https://urbania-backend.onrender.com/api` (Remplacez par l'URL réelle de votre backend) |
| `VITE_FIREBASE_API_KEY` | (Votre API Key Firebase Web) |
| `VITE_FIREBASE_AUTH_DOMAIN` | `urbaniaa-86d1f.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `urbaniaa-86d1f` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `urbaniaa-86d1f.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (Votre Sender ID) |
| `VITE_FIREBASE_APP_ID` | (Votre App ID) |

> **Note**: Les variables Frontend (`VITE_*`) sont intégrées au moment du build. Si vous les changez, vous devez relancer un "Manual Deploy" -> "Clear Cache and Deploy".

---

## ℹ️ Configuration Google Auth (Post-Déploiement)
1. Une fois le frontend déployé, récupérez son URL (ex: `https://urbania-frontend.onrender.com`).
2. Allez dans la **Google Cloud Console** (APIs & Services -> Credentials).
3. Modifiez votre Client OAuth 2.0.
4. Ajoutez l'URL de votre frontend dans **"Authorized JavaScript origins"**.
5. Ajoutez l'URL de votre frontend dans **"Authorized redirect URIs"**.
