#!/usr/bin/env python3
import os
import requests
import base64
from PIL import Image
import io

# Charger les variables d'environnement depuis le fichier .env du backend
backend_env = os.path.join(os.path.dirname(__file__), 'backend', '.env')
if os.path.exists(backend_env):
    with open(backend_env, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Récupérer la clé API
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')
if not STABILITY_API_KEY:
    print("❌ STABILITY_API_KEY non trouvée dans l'environnement")
    exit(1)

print("🔑 Clé API trouvée, test en cours...")

# Configuration Stability AI
engine_id = "stable-diffusion-xl-1024-v1-0"
api_host = "https://api.stability.ai"
url = f"{api_host}/v1/generation/{engine_id}/text-to-image"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {STABILITY_API_KEY}"
}

# Prompt de test simple
body = {
    "text_prompts": [
        {
            "text": "A beautiful house plan sketch, architectural drawing, clean lines, professional",
            "weight": 1
        }
    ],
    "cfg_scale": 7,
    "height": 1024,
    "width": 1024,
    "samples": 1,
    "steps": 30,
}

try:
    print("📡 Envoi de la requête à Stability AI...")
    response = requests.post(url, headers=headers, json=body, timeout=60)

    if response.status_code == 200:
        print("✅ Réponse réussie de Stability AI!")
        data = response.json()

        if data.get("artifacts") and len(data["artifacts"]) > 0:
            img_base64 = data["artifacts"][0]["base64"]
            print(f"🎨 Image générée! Taille: {len(img_base64)} caractères base64")

            # Décoder et sauvegarder l'image
            img_data = base64.b64decode(img_base64)
            img = Image.open(io.BytesIO(img_data))

            # Sauvegarder l'image de test
            test_image_path = os.path.join(os.path.dirname(__file__), 'stability_test_image.png')
            img.save(test_image_path)
            print(f"💾 Image sauvegardée: {test_image_path}")

            print("🎯 Test réussi! L'API Stability AI fonctionne correctement.")
        else:
            print("❌ Aucune image dans la réponse")
    else:
        print(f"❌ Erreur API: {response.status_code}")
        print(f"📄 Réponse: {response.text}")

except requests.exceptions.Timeout:
    print("⏰ Timeout - L'API ne répond pas")
except Exception as e:
    print(f"💥 Erreur: {str(e)}")
