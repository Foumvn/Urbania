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
            line = line.strip()
            if line and not line.startswith('#'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

# Récupérer la clé API
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')
if not STABILITY_API_KEY:
    print("❌ STABILITY_API_KEY non trouvée")
    exit(1)

print("🔑 Clé API chargée, génération d'un plan technique...")

# Configuration Stability AI
engine_id = "stable-diffusion-xl-1024-v1-0"
api_host = "https://api.stability.ai"
url = f"{api_host}/v1/generation/{engine_id}/text-to-image"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {STABILITY_API_KEY}"
}

# Prompt technique pour DP2/DP3 - style purement technique 2D
body = {
    "text_prompts": [
        {
            "text": "Professional 2D CAD architectural plan, technical black linework on white background, DP2 site plan, precise plot boundaries, roof outlines, no perspective, 2D orthographic projection, clean CAD aesthetics, minimalist, no shading, no colors, pure technical drawing, schematic lines only",
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
    print("📡 Génération du plan technique...")
    response = requests.post(url, headers=headers, json=body, timeout=60)

    if response.status_code == 200:
        print("✅ Plan technique généré!")
        data = response.json()

        if data.get("artifacts") and len(data["artifacts"]) > 0:
            img_base64 = data["artifacts"][0]["base64"]

            # Décoder et sauvegarder l'image
            img_data = base64.b64decode(img_base64)
            img = Image.open(io.BytesIO(img_data))

            # Sauvegarder l'image technique
            technical_image_path = os.path.join(os.path.dirname(__file__), 'stability_technical_plan.png')
            img.save(technical_image_path)
            print(f"💾 Plan technique sauvegardé: {technical_image_path}")

            print("🎯 Plan technique 2D généré avec succès!")
        else:
            print("❌ Aucune image générée")
    else:
        print(f"❌ Erreur API: {response.status_code}")
        print(f"📄 Réponse: {response.text}")

except Exception as e:
    print(f"💥 Erreur: {str(e)}")
