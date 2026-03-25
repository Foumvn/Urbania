import os
import sys
import subprocess
import json
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).resolve().parent
GALLAGHER_DIR = BASE_DIR / "api/templates/cerfa"
FILL_SCRIPT = GALLAGHER_DIR / "fill_odg.py"
TEMPLATE_ODG = GALLAGHER_DIR / "c.odg"

def map_urbania_to_cerfa(data):
    """
    Traduit les données Urbania vers les clés attendues par le script de Gallagher (fred).
    """
    mapping = {}
    
    # 1. Identité (Urbania -> Cerfa)
    mapping["nom_particulier"] = data.get("nom", "DUPONT").upper()
    mapping["prenom_particulier"] = data.get("prenom", "Jean-Pierre").capitalize()
    
    # Décomposition des dates (Exemple: 01/02/1980)
    dob = data.get("dateNaissance", "01/01/1985").split("/")
    if len(dob) == 3:
        mapping["jour_naissance_01"] = dob[0][0]
        mapping["jour_naissance_02"] = dob[0][1]
        mapping["mois_naissance_01"] = dob[1][0]
        mapping["mois_naissance_02"] = dob[1][1]
        mapping["annee_naissance_01"] = dob[2][0]
        mapping["annee_naissance_02"] = dob[2][1]
        mapping["annee_naissance_03"] = dob[2][2]
        mapping["annee_naissance_04"] = dob[2][3]

    # 2. Localisation Terrain
    mapping["commune_particulier"] = data.get("terrainVille", "PARIS")
    
    # Code Postal décomposé
    cp = data.get("terrainCodePostal", "75001")
    for i, digit in enumerate(cp[:5]):
        mapping[f"address_code_postal_{i+1:02d}"] = digit
        mapping[f"codepostal_localisation_terrain_{i+1:02d}"] = digit

    # 3. Nature des Travaux
    nature = data.get("natureTravaux", "").lower()
    description = data.get("descriptionProjet", "")
    
    mapping["nature_travaux_courte_description"] = description[:100]
    
    # Cases à cocher (Mapping intelligent)
    if "piscine" in nature or "piscine" in description.lower():
        mapping["case_type_travaux_piscine"] = "true"
    if "garage" in nature or "garage" in description.lower():
        mapping["case_type_travaux_garage"] = "true"
    if "abri de jardin" in nature or "abri" in description.lower():
        mapping["case_type_travaux_abri_jardin"] = "true"
    
    # 4. Emprise au sol
    mapping["emprise_sol_crees"] = str(data.get("surfaceCreee", "0"))
    
    return mapping

def generate_cerfa(test_data, output_pdf="final_cerfa_urbania.pdf"):
    print(f"🛠️ Préparation du mapping pour Urbania...")
    cerfa_data = map_urbania_to_cerfa(test_data)
    
    # Construction de la commande --set
    set_args = []
    for k, v in cerfa_data.items():
        set_args.extend(["--set", f"{k}={v}"])
    
    # Commande pour lancer le remplissage
    # Note: On suppose que LibreOffice est déjà lancé ou qu'on le gère ici
    print(f"🚀 Lancement du remplissage via le script 'fred'...")
    
    try:
        # On démarre LibreOffice en arrière-plan
        lo_process = subprocess.Popen([
            "libreoffice", "--headless", 
            "--accept=socket,host=localhost,port=2002;urp;StarOffice.ServiceManager"
        ])
        
        import time
        time.sleep(2) # Attendre que LO démarre
        
        cmd = [sys.executable, str(FILL_SCRIPT), str(TEMPLATE_ODG), "--pdf", output_pdf] + set_args
        subprocess.run(cmd, check=True)
        
        print(f"✅ Cerfa généré avec succès : {output_pdf}")
        
    finally:
        # Arrêt de LibreOffice
        subprocess.run(["pkill", "-f", "libreoffice"])

if __name__ == "__main__":
    # Données simulées venant du frontend Urbania
    urbania_project_data = {
        "nom": "Gallo",
        "prenom": "Fred",
        "dateNaissance": "12/05/1988",
        "terrainVille": "Marseille",
        "terrainCodePostal": "13008",
        "natureTravaux": "Garage et Abri de jardin",
        "descriptionProjet": "Construction d'un garage de 20m2 et d'un petit abri de jardin en bois.",
        "surfaceCreee": 25,
        "empriseSolCreee": 25
    }
    
    generate_cerfa(urbania_project_data)
