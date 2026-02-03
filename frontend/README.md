# Urbania CERFA Builder

Application web pour remplir le formulaire CERFA 13703 (Déclaration Préalable de Travaux) de manière guidée, étape par étape.

## 🚀 Installation

```bash
# Cloner le projet
cd /home/jordan-bana/Documents/urbaniaCerfa

# Installer les dépendances
npm install

# Lancer l'application (frontend + backend)
npm run dev
```

## 📍 URLs

| Service | URL |
|---------|-----|
| Application | http://localhost:5173 |
| API Backend | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/api/health |

## 🏗️ Architecture

```
urbaniaCerfa/
├── src/                    # Frontend React
│   ├── components/         # Composants React
│   │   ├── Admin/         # Dashboard admin
│   │   ├── Common/        # Composants réutilisables
│   │   ├── Layout/        # Layout principal
│   │   ├── Preview/       # Aperçu PDF
│   │   ├── Steps/         # Étapes du formulaire
│   │   └── Wizard/        # Orchestrateur wizard
│   ├── context/           # Contexte React
│   └── utils/             # Utilitaires
├── server/                # Backend Express
│   └── index.js           # API + Swagger
└── public/                # Assets statiques
```

## 📦 Stack Technique

- **Frontend**: React 18 + Vite + Material UI
- **Backend**: Node.js + Express
- **PDF**: pdf-lib
- **Documentation API**: Swagger UI

## 📋 Fonctionnalités

- ✅ Formulaire wizard en 10 étapes
- ✅ Validation en temps réel
- ✅ Aperçu live du CERFA
- ✅ Génération PDF
- ✅ Sauvegarde automatique (localStorage)
- ✅ Dashboard admin
- ✅ API documentée (Swagger)
- ✅ Interface responsive

## 🔧 Scripts

```bash
npm run dev         # Lance frontend + backend
npm run dev:client  # Lance uniquement le frontend
npm run dev:server  # Lance uniquement le backend
npm run build       # Build production
```
