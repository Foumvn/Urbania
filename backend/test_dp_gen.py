import os
import sys
import django
from dotenv import load_dotenv

# Setup Django environment
sys.path.append('/home/zfred/Bureau/Zfred/Urbanisation_Warren/Urbania/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbania_backend.settings')
django.setup()

from api.services.dp_generator_service import DPGeneratorService

load_dotenv()

print("🚀 Testing Urbania DP Generation (RAS Style via Gemini)...")

test_cases = [
    {
        "type": "dp3",
        "name": "Plan en Coupe (DP3)",
        "data": {
            "natureTravaux": "Piscine et terrasse",
            "descriptionProjet": "Construction d'une piscine enterrée de 8x4m avec terrasse en bois attenante",
            "materiauFacade": "Béton armé avec liner gris",
            "materiauToiture": "N/A",
            "terrainVille": "Bordeaux",
            "surfaceCreee": 32,
            "hauteurConstruction": -1.5,
            "materiaux": "Composite pour la terrasse, liner PVC gris pour le bassin"
        }
    },
    {
        "type": "dp4",
        "name": "Façades et Toitures (DP4)",
        "data": {
            "natureTravaux": "Garage",
            "descriptionProjet": "Construction d'un garage indépendant avec toiture bi-pente",
            "materiauFacade": "Bardage bois naturel",
            "couleurFacade": "Chêne clair",
            "materiauToiture": "Tuiles terre cuite",
            "couleurToiture": "Rouge vieilli",
            "hauteurConstruction": 3.5,
            "surfaceCreee": 25
        }
    },
    {
        "type": "dp3",
        "name": "Messy Data Consistency Test (Garage)",
        "data": {
            "descriptionProjet": "Je souhaite construire un garage en bois de 6m par 4m avec une porte blanche",
            "longueure": 6,
            "larger": 4,
            "hauteure": 3.2,
            "materiau": "Bois de mélèze",
            "couleur": "Naturel"
        }
    }
]

for case in test_cases:
    print(f"\n--- Testing {case['name']} ---")
    try:
        # Provider defaults to GEMINI in the new implementation
        result = DPGeneratorService.generate_plan(case['data'], case['type'])
        
        print(f"✅ Success for {case['type']}!")
        print(f"   Provider: {result['provider']}")
        print(f"   Format: {result['format']}")
        print(f"   Image data length: {len(result['image'])}")
        
        # Save a sample to verify it's valid base64
        with open(f"test_output_{case['type']}.png", "wb") as f:
            import base64
            f.write(base64.b64decode(result['image']))
        print(f"   Saved to test_output_{case['type']}.png")
        
    except Exception as e:
        print(f"❌ Error for {case['type']}: {e}")
        import traceback
        traceback.print_exc()

print("\n✨ Test sequence finished.")
