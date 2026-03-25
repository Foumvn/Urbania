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

print("🔑 Clé API chargée, génération d'un plan technique professionnel...")

# Configuration Stability AI
engine_id = "stable-diffusion-xl-1024-v1-0"
api_host = "https://api.stability.ai"
url = f"{api_host}/v1/generation/{engine_id}/text-to-image"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {STABILITY_API_KEY}"
}

# Prompt ultra-technique pour plans urbains professionnels
body = {
    "text_prompts": [
        {
            "text": "Professional cadastral plan, technical drawing, black ink on white paper, precise plot boundaries with coordinates, building footprints, urban planning document, no colors, no shading, pure technical linework, orthographic projection, scale indicators, north arrow, dimension lines, professional urban planning standards",
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
    print("📡 Génération du plan technique professionnel...")
    response = requests.post(url, headers=headers, json=body, timeout=60)

    if response.status_code == 200:
        print("✅ Plan technique professionnel généré!")
        data = response.json()

        if data.get("artifacts") and len(data["artifacts"]) > 0:
            img_base64 = data["artifacts"][0]["base64"]

            # Décoder et sauvegarder l'image
            img_data = base64.b64decode(img_base64)
            img = Image.open(io.BytesIO(img_data))

            # Sauvegarder l'image technique professionnelle
            professional_image_path = os.path.join(os.path.dirname(__file__), 'stability_professional_plan.png')
            img.save(professional_image_path)
            print(f"💾 Plan professionnel sauvegardé: {professional_image_path}")

            print("🎯 Plan technique professionnel généré avec succès!")
        else:
            print("❌ Aucune image générée")
    else:
        print(f"❌ Erreur API: {response.status_code}")
        print(f"📄 Réponse: {response.text}")

except Exception as e:
    print(f"💥 Erreur: {str(e)}")
