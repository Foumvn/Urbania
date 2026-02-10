# 🔐 Guide de Configuration - Authentification Google avec Firebase

## ✅ Ce qui a été implémenté

### Frontend (React + Vite)
- ✅ Installation de Firebase SDK
- ✅ Configuration Firebase (`src/config/firebase.js`)
- ✅ Hook personnalisé `useGoogleAuth` (`src/hooks/useGoogleAuth.js`)
- ✅ Intégration dans `Login.jsx` et `Register.jsx`
- ✅ Boutons Google fonctionnels avec gestion d'état
- ✅ Variables d'environnement configurables

### Backend (FastAPI)
- ✅ Documentation complète pour l'endpoint `/auth/google`
- ✅ Guide de validation de token Google
- ✅ Instructions pour la création d'utilisateur

---

## 📋 Étapes de Configuration

### 1️⃣ Configuration Firebase Console

1. **Créer un projet Firebase** :
   - Allez sur https://console.firebase.google.com/
   - Cliquez sur "Ajouter un projet"
   - Nommez-le (ex: "Urbania")
   - Désactivez Google Analytics si non nécessaire

2. **Activer l'authentification Google** :
   - Dans le menu → **Authentication** → **Sign-in method**
   - Cliquez sur **Google**
   - Activez le toggle
   - Sélectionnez un email de support
   - Cliquez sur **Enregistrer**

3. **Récupérer les clés de configuration** :
   - Dans **Project Settings** (⚙️ en haut à gauche)
   - Descendez jusqu'à "Your apps"
   - Cliquez sur l'icône `</>` (Web)
   - Donnez un nom à l'app (ex: "Urbania Web")
   - Copiez les valeurs de `firebaseConfig`

### 2️⃣ Configuration Frontend

1. **Créer le fichier `.env`** :
   ```bash
   cd Urbania/frontend
   cp .env.example .env
   ```

2. **Remplir les variables Firebase** dans `.env` :
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=urbania-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=urbania-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=urbania-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

### 3️⃣ Configuration Backend (FastAPI)

1. **Installer les dépendances Python** :
   ```bash
   cd Urbania/backend
   pip install google-auth google-auth-httplib2 google-auth-oauthlib
   ```

2. **Créer l'endpoint** dans `routes/auth.py` :
   - Suivez les instructions dans `GOOGLE_AUTH_SETUP.md`
   - Implémentez la validation du token Google
   - Créez ou récupérez l'utilisateur dans votre DB
   - Retournez votre propre JWT token

3. **Ajouter les variables d'environnement** dans `.env` backend :
   ```env
   GOOGLE_CLIENT_ID=123456789-xxxxxxx.apps.googleusercontent.com
   ```
   > ⚠️ Vous trouverez le `GOOGLE_CLIENT_ID` dans :
   > Firebase Console → Project Settings → Your apps → SDK setup and configuration → Config

4. **Redémarrer le backend** :
   ```bash
   uvicorn main:app --reload
   ```

### 4️⃣ Configuration Google Cloud Console

1. **Accéder aux credentials** :
   - La Google Cloud Console est automatiquement liée à Firebase
   - Vous pouvez y accéder directement depuis Firebase
   - Ou allez sur https://console.cloud.google.com/

2. **Configurer les origines autorisées** :
   - APIs & Services → Credentials
   - Cliquez sur votre OAuth 2.0 Client ID
   - Ajoutez dans **Authorized JavaScript origins** :
     ```
     http://localhost:5173
     http://localhost:3000
     https://votre-domaine.com (en production)
     ```
   - Ajoutez dans **Authorized redirect URIs** :
     ```
     http://localhost:5173
     https://votre-domaine.com (en production)
     ```

---

## 🔄 Flux d'authentification

```
1. Utilisateur clique sur "Continuer avec Google"
   ↓
2. Popup Google s'ouvre (géré par Firebase)
   ↓
3. Utilisateur se connecte et autorise
   ↓
4. Firebase retourne un ID Token
   ↓
5. Le hook useGoogleAuth envoie le token au backend (/api/auth/google)
   ↓
6. Backend valide le token avec Google
   ↓
7. Backend crée/récupère l'utilisateur
   ↓
8. Backend retourne son propre JWT
   ↓
9. Frontend stocke le token et redirige vers /dashboard
```

---

## 🧪 Test de l'implémentation

1. **Frontend uniquement** (sans backend encore configuré) :
   - Vous verrez la popup Google s'ouvrir
   - L'authentification échouera au niveau de l'appel API backend
   - C'est normal !

2. **Avec backend configuré** :
   - La connexion complète devrait fonctionner
   - L'utilisateur sera créé/connecté
   - Redirection vers le dashboard

---

## 🐛 Troubleshooting

### Erreur "idpiframe_initialization_failed"
- Vérifiez que les origines JavaScript sont bien configurées dans Google Cloud Console
- Assurez-vous d'être en `http://localhost:5173` et non `127.0.0.1`

### Erreur "popup_closed_by_user"
- L'utilisateur a fermé la popup avant de finir
- C'est normal, pas besoin de gérer spécialement

### Erreur 401 "Invalid Google token"
- Vérifiez que `GOOGLE_CLIENT_ID` dans le backend correspond à celui de Firebase
- Le token peut expirer, faites un nouveau test

### Firebase not initialized
- Vérifiez que toutes les variables `VITE_FIREBASE_*` sont bien remplies dans `.env`
- Redémarrez `npm run dev` après modification du `.env`

---

## 📚 Ressources

- **Documentation Firebase Auth** : https://firebase.google.com/docs/auth/web/google-signin
- **Google Identity** : https://developers.google.com/identity
- **Firebase Console** : https://console.firebase.google.com/
- **Google Cloud Console** : https://console.cloud.google.com/

---

## 🎯 Prochaines étapes

1. ✅ Configurer Firebase Console
2. ✅ Remplir le `.env` frontend
3. ⏳ Implémenter l'endpoint backend `/auth/google`
4. ⏳ Tester le flux complet
5. ⏳ Déployer en production avec les bonnes URLs

---

**Besoin d'aide ?** Consultez le fichier `GOOGLE_AUTH_SETUP.md` pour plus de détails sur l'implémentation backend.
