#!/usr/bin/env python3
"""
Script de test pour les modes Dask et Light du DPGeneratorService
"""

import os
import sys
sys.path.append('backend')

from api.services.dp_generator_service import DPGeneratorService

def test_modes():
    """Test des différents modes d'exécution"""

    print("🧪 Test des modes d'exécution DPGeneratorService")
    print("=" * 50)

    # Test des données
    test_data = {
        'natureTravaux': ['Construction neuve'],
        'descriptionProjet': 'Maison moderne 2 étages',
        'materiauFacade': 'Enduit',
        'couleurFacade': 'Blanc',
        'surfaceTheorique': '200m²'
    }

    # Test du mode actuel
    print(f"📋 Mode actuel: {DPGeneratorService.get_execution_mode()}")
    print()

    # Test mode STANDARD
    print("1️⃣ Test du mode STANDARD")
    try:
        DPGeneratorService.set_execution_mode("standard")
        result_standard = DPGeneratorService.generate_plan(test_data, 'dp3', 'STABILITY')
        print("✅ Mode STANDARD réussi"        print(f"   Provider: {result_standard.get('provider')}")
    except Exception as e:
        print(f"❌ Mode STANDARD échoué: {e}")
    print()

    # Test mode LIGHT
    print("2️⃣ Test du mode LIGHT")
    try:
        DPGeneratorService.set_execution_mode("light")
        result_light = DPGeneratorService.generate_plan(test_data, 'dp3', 'STABILITY')
        print("✅ Mode LIGHT réussi"        print(f"   Provider: {result_light.get('provider')}")
    except Exception as e:
        print(f"❌ Mode LIGHT échoué: {e}")
    print()

    # Test mode DASK (si disponible)
    print("3️⃣ Test du mode DASK")
    if DPGeneratorService.initialize_dask():
        try:
            DPGeneratorService.set_execution_mode("dask")
            result_dask = DPGeneratorService.generate_plan(test_data, 'dp3', 'STABILITY')
            print("✅ Mode DASK réussi"            print(f"   Provider: {result_dask.get('provider')}")
        except Exception as e:
            print(f"❌ Mode DASK échoué: {e}")
        finally:
            DPGeneratorService.shutdown_dask()
    else:
        print("⚠️ Dask non disponible - test ignoré")
    print()

    # Remettre le mode standard
    DPGeneratorService.set_execution_mode("standard")
    print("🔄 Mode remis à STANDARD")

    print("🎯 Tests terminés!")

if __name__ == "__main__":
    test_modes()
