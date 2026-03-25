# Configuration Stability AI pour Urbania

## 🎯 Objectif
Ce guide explique comment obtenir et configurer votre clé API Stability AI pour remplacer Hugging Face dans la génération de plans techniques (DP1-DP4).

## 📋 Étapes de Configuration

### 1. Créer un Compte Stability AI

1. Allez sur [https://platform.stability.ai](https://platform.stability.ai)
2. Cliquez sur **"Sign Up"** ou **"Get Started"**
3. Créez votre compte (email + mot de passe ou via Google/GitHub)
4. Vérifiez votre email si nécessaire

### 2. Obtenir votre Clé API

1. Une fois connecté, allez dans votre **Dashboard**
2. Naviguez vers **"API Keys"** dans le menu latéral
3. Cliquez sur **"Create API Key"**
4. Donnez un nom à votre clé (ex: "Urbania Production")
5. Copiez la clé générée (format: `sk-...`)
   
   ⚠️ **Important** : Sauvegardez cette clé immédiatement, elle ne sera plus visible après fermeture !

### 3. Vérifier les Crédits

- Stability AI offre généralement **25 crédits gratuits** à l'inscription
- Chaque génération d'image SDXL coûte environ **0.02-0.04 crédits**
- Vous pouvez générer ~600-1000 images avec les crédits gratuits
- Pour plus de crédits, ajoutez une carte bancaire dans **"Billing"**

### 4. Configuration Locale (Développement)

Créez ou modifiez le fichier `backend/.env` :

```bash
# Stability AI Configuration (Primaire)
STABILITY_API_KEY=sk-VOTRE_CLE_ICI

# Stability AI Backup (Optionnel - pour éviter les quotas)
STABILITY_API_KEY_2=sk-VOTRE_DEUXIEME_CLE

# Hugging Face Fallback (Optionnel)
HUGGINGFACE_API_KEY=hf_VOTRE_TOKEN
HUGGINGFACE_API_KEY_2=hf_VOTRE_TOKEN_2

# Provider par défaut
IMAGE_PROVIDER=STABILITY
```

### 5. Configuration Production (Render)

Dans votre Web Service Render :

1. Allez dans **"Environment"** → **"Environment Variables"**
2. Ajoutez les variables suivantes :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `STABILITY_API_KEY` | `sk-...` | ✅ Oui |
| `STABILITY_API_KEY_2` | `sk-...` | ⚪ Optionnel |
| `HUGGINGFACE_API_KEY` | `hf_...` | ⚪ Optionnel (fallback) |
| `IMAGE_PROVIDER` | `STABILITY` | ✅ Oui |

3. Cliquez sur **"Save Changes"**
4. Render redémarrera automatiquement votre service

## 🧪 Tester l'Intégration

### Test Manuel via Python

```python
import os
import requests
import json

api_key = "sk-VOTRE_CLE"
url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

body = {
    "text_prompts": [{"text": "Architectural site plan, technical drawing", "weight": 1}],
    "cfg_scale": 7,
    "height": 1024,
    "width": 1024,
    "samples": 1,
    "steps": 30
}

response = requests.post(url, headers=headers, json=body)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print("✅ Génération réussie!")
else:
    print(f"❌ Erreur: {response.text}")
```

### Test via l'Application

1. Démarrez le backend : `cd backend && python manage.py runserver`
2. Démarrez le frontend : `cd frontend && npm run dev`
3. Créez un nouveau formulaire CERFA
4. Allez jusqu'à l'étape "Documents"
5. Cliquez sur "Générer DP1" ou "Générer DP2"
6. Vérifiez les logs backend pour voir :
   ```
   DEBUG: Tentative Stability AI avec la clé sk-****...****
   Generating dp1 via STABILITY with prompt: ...
   ```

## 🔄 Système de Fallback

Le système est configuré avec un fallback automatique :

1. **Tentative Stability AI** (provider principal)
   - Essaie avec `STABILITY_API_KEY`
   - Si échec/quota, essaie `STABILITY_API_KEY_2`
   
2. **Fallback Hugging Face** (si Stability échoue)
   - Essaie avec `HUGGINGFACE_API_KEY`
   - Si échec/quota, essaie `HUGGINGFACE_API_KEY_2`

3. **Erreur finale** si tous les providers échouent

## 📊 Comparaison Stability AI vs Hugging Face

| Critère | Stability AI | Hugging Face |
|---------|--------------|--------------|
| **Qualité** | ⭐⭐⭐⭐⭐ SDXL 1024x1024 | ⭐⭐⭐⭐ FLUX 512x512 |
| **Vitesse** | ~20-30s | ~10-15s |
| **Quota Gratuit** | 25 crédits (~600 images) | Limité par heure |
| **Fiabilité** | ⭐⭐⭐⭐⭐ Très stable | ⭐⭐⭐ Variable |
| **Coût** | $0.02-0.04/image | Gratuit (limité) |
| **Support** | Documentation officielle | Communautaire |

## 🐛 Dépannage

### Erreur 401 "Unauthorized"
- Vérifiez que votre clé API est correcte
- Assurez-vous qu'elle commence par `sk-`
- Vérifiez qu'elle n'a pas expiré

### Erreur 429 "Too Many Requests"
- Vous avez dépassé le quota
- Ajoutez une `STABILITY_API_KEY_2` de secours
- Ou attendez la réinitialisation du quota

### Erreur 402 "Payment Required"
- Vos crédits gratuits sont épuisés
- Ajoutez une carte bancaire dans "Billing"
- Ou utilisez le fallback Hugging Face

### Images de Mauvaise Qualité
- Augmentez `steps` de 30 à 50 dans `dp_generator_service.py`
- Ajustez `cfg_scale` entre 5-15
- Améliorez les prompts techniques

## 💡 Conseils d'Optimisation

1. **Utilisez 2 clés API** pour doubler votre quota
2. **Activez le fallback HF** pour continuité de service
3. **Cachez les résultats** pour éviter re-générations
4. **Surveillez vos crédits** dans le dashboard Stability AI
5. **Ajustez les paramètres** selon vos besoins (qualité vs vitesse)

## 📚 Ressources

- [Documentation Stability AI](https://platform.stability.ai/docs/api-reference)
- [Pricing Stability AI](https://platform.stability.ai/pricing)
- [Status Page](https://status.stability.ai/)
- [Support](https://platform.stability.ai/support)

---

**Configuration terminée !** 🎉

Votre système Urbania utilise maintenant Stability AI pour générer des plans techniques de haute qualité.
