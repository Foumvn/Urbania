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

print("Testing DP Generation...")
try:
    data = {
        "natureTravaux": "extension",
        "descriptionProjet": "Extension de 20m2",
        "materiauFacade": "Enduit",
        "couleurFacade": "Beige",
        "surfaceTheorique": 20
    }
    # Test DP3 (Coupe) as requested
    result = DPGeneratorService.generate_plan(data, 'dp3', provider='HUGGINGFACE')
    print("Success!")
    print(f"Format: {result['format']}")
    print(f"Image length: {len(result['image'])}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
