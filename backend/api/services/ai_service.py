import requests
import json
import logging
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    # URL de l'API Mistral Cloud
    MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
    # Modèle recommandé : open-mistral-7b (excellent pour le français et structuré)
    MODEL_NAME = "open-mistral-7b"
    
    # Récupération de la clé API depuis les variables d'environnement ou une valeur par défaut
    # NOTE : L'utilisateur devra configurer sa clé MISTRAL_API_KEY
    API_KEY = os.environ.get("MISTRAL_API_KEY", "VOTRE_CLE_API_ICI")

    @classmethod
    def call_mistral(cls, prompt, is_json=True):
        """Appel à l'API Mistral Cloud."""
        if cls.API_KEY == "VOTRE_CLE_API_ICI" or not cls.API_KEY:
            logger.error("Clé API Mistral non configurée.")
            return None

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {cls.API_KEY}"
        }
        
        system_content = "Tu es un expert en urbanisme français. "
        if is_json:
            system_content += "Tu réponds uniquement en format JSON valide, sans blabla."
        else:
            system_content += "Tu réponds par un texte clair et professionnel, sans blabla."

        payload = {
            "model": cls.MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": prompt}
            ]
        }
        
        if is_json:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = requests.post(cls.MISTRAL_URL, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()
            
            # Nettoyage si jamais le modèle a inclus des balises markdown malgré json_object
            if content.startswith("```"):
                parts = content.split("```")
                if len(parts) > 1:
                    content = parts[1]
                    if content.startswith("json"):
                        content = content[4:]
            return content.strip()
        except Exception as e:
            logger.error(f"Erreur lors de l'appel à Mistral Cloud: {str(e)}")
            return None

    @classmethod
    def analyze_project(cls, description):
        """Analyse la description du projet pour suggérer des matériaux et couleurs."""
        prompt = f"""
        Analyse la description suivante d'un projet de travaux pour un formulaire CERFA.
        Extrais les informations sous forme de JSON uniquement.
        
        Description: "{description}"
        
        Structure JSON attendue:
        {{
            "couleurFacade": "choisir précisément parmi [Blanc, Beige, Gris clair, Gris foncé, Noir, Bleu, Vert, Marron, Rouge, Terracotta, Autre]",
            "couleurToiture": "choisir précisément parmi [Blanc, Beige, Gris clair, Gris foncé, Noir, Bleu, Vert, Marron, Rouge, Terracotta, Autre]",
            "materiauFacade": "choisir précisément parmi [Enduit, Crépi, Bardage bois, Pierre, Brique, Béton, Métal, Autre]",
            "materiauToiture": "choisir précisément parmi [Tuiles, Ardoises, Zinc, Bac acier, Toit terrasse, Bois, Autre]",
            "hauteurConstruction": "nombre en mètres (float) ou null si non mentionné"
        }}
        
        Règle : Si une information n'est pas mentionnée, mets null.
        """
        response_text = cls.call_mistral(prompt)
        if response_text:
            try:
                data = json.loads(response_text)
                # Assurer que les clés attendues existent (même si null)
                expected_keys = ["couleurFacade", "couleurToiture", "materiauFacade", "materiauToiture", "hauteurConstruction"]
                return {key: data.get(key) for key in expected_keys}
            except json.JSONDecodeError:
                logger.error(f"Erreur de décodage JSON: {response_text}")
        return {"couleurFacade": None, "couleurToiture": None, "materiauFacade": None, "materiauToiture": None, "hauteurConstruction": None}

    @classmethod
    def suggest_documents(cls, description):
        """Détermine les documents DP obligatoires en fonction du type de projet."""
        prompt = f"""
        En fonction de la description du projet ci-dessous, détermine si les pièces suivantes (DP1 à DP8) sont obligatoires pour une déclaration préalable.
        
        Description: "{description}"
        
        Liste des pièces à évaluer:
        - dp1: Plan de situation (Toujours obligatoire)
        - dp2: Plan de masse (Obligatoire si création de construction ou modification d'emprise au sol)
        - dp3: Plan de coupe (Obligatoire si le profil du terrain est modifié)
        - dp4: Plans des façades et des toitures (Obligatoire si modification de l'aspect extérieur)
        - dp5: Représentation de l'aspect extérieur (Si modification visible depuis l'espace public)
        - dp6: Document graphique d'insertion (Si modification du volume ou de l'aspect extérieur)
        - dp7: Photographie environnement proche (Toujours obligatoire)
        - dp8: Photographie environnement lointain (Toujours obligatoire)

        Réponds uniquement avec un objet JSON où les clés sont dp1, dp2, etc. et les valeurs sont des booléens.
        """
        response_text = cls.call_mistral(prompt)
        if response_text:
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                logger.error("Erreur de décodage JSON de la réponse Mistral")
        return None

    @classmethod
    def configure_custom_project(cls, description):
        """Configure dynamiquement un projet personnalisé (type 'Autre').
        
        Retourne une configuration complète incluant les champs requis,
        les documents obligatoires et les questions spécifiques.
        """
        prompt = f"""
        Analyse la description suivante d'un projet de travaux (type personnalisé/autre) pour configurer un formulaire CERFA.
        
        Description: "{description}"
        
        Tu dois déterminer :
        1. Les champs obligatoires parmi : surfaceTerrain, surfacePlancherCreee, hauteurConstruction, couleurFacade, materiauFacade, couleurToiture, materiauToiture
        2. Les documents obligatoires parmi : dp1, dp2, dp3, dp4, dp5, dp6, dp7, dp8
        3. Des questions spécifiques à ce type de projet (0 à 3 questions max)
        
        Règles pour les documents :
        - dp1 (Plan de situation) : TOUJOURS obligatoire
        - dp2 (Plan de masse) : Si création de construction ou modification d'emprise au sol
        - dp3 (Plan de coupe) : Si modification du profil du terrain ou création en hauteur
        - dp4 (Façades et toitures) : Si modification de l'aspect extérieur d'un bâtiment
        - dp5 (Représentation extérieure) : Si modification visible depuis l'espace public
        - dp6 (Insertion paysagère) : Si création ou modification de volume
        - dp7 (Photo proche) : TOUJOURS obligatoire
        - dp8 (Photo lointaine) : Si impact paysager significatif
        
        Réponds uniquement avec un objet JSON valide :
        {{
            "requiredFields": ["surfaceTerrain", ...],
            "requiredDocuments": ["dp1", "dp2", ...],
            "specificQuestions": [
                {{ "field": "nomDuChamp", "label": "Question à afficher", "type": "text|number|boolean|select", "options": ["option1", "option2"] }}
            ],
            "projectCategory": "construction|modification|amenagement|demolition"
        }}
        """
        response_text = cls.call_mistral(prompt)
        if response_text:
            try:
                data = json.loads(response_text)
                # S'assurer que dp1 et dp7 sont toujours présents
                required_docs = data.get("requiredDocuments", [])
                if "dp1" not in required_docs:
                    required_docs.append("dp1")
                if "dp7" not in required_docs:
                    required_docs.append("dp7")
                data["requiredDocuments"] = required_docs
                return data
            except json.JSONDecodeError:
                logger.error(f"Erreur de décodage JSON pour configure_custom_project: {response_text}")
        # Configuration par défaut si l'IA échoue
        return {
            "requiredFields": ["surfaceTerrain", "surfacePlancherCreee"],
            "requiredDocuments": ["dp1", "dp2", "dp6", "dp7"],
            "specificQuestions": [],
            "projectCategory": "autre"
        }

    @classmethod
    def generate_description(cls, project_type, nature_travaux, other_nature=""):
        """Génère une description ultra-concise pour le CERFA."""
        prompt = f"""
        Rédige une description technique ultra-courte pour un formulaire CERFA.
        Type: {project_type}
        Nature: {', '.join(nature_travaux) if isinstance(nature_travaux, list) else nature_travaux} {f'({other_nature})' if other_nature else ''}
        
        RÈGLES STRICTES :
        - MAXIMUM 2 PHRASES.
        - MAXIMUM 12 MOTS PAR PHRASE.
        - PAS de gras, PAS d'astérisques (**), PAS de titre.
        - Texte brut uniquement.
        """
        response_text = cls.call_mistral(prompt, is_json=False)
        if response_text:
            # Nettoyage radical: pas d'astérisques, pas de JSON
            cleaned = response_text.replace('*', '').replace('#', '').strip()
            if cleaned.startswith('{') and cleaned.endswith('}'):
                try:
                    data = json.loads(cleaned)
                    cleaned = data.get("description", cleaned)
                except:
                    pass
            return cleaned
        return "Aménagement d'une pièce indépendante conforme aux règles d'urbanisme."

    @classmethod
    def generate_dp1_svg(cls, address, city, cp):
        """Génère un SVG pour le DP1 (Plan de situation).
        En attendant une intégration Mapbox réelle, on génère un plan schématique pro.
        """
        # Simulation d'un plan de situation technique
        svg = f"""
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8fafc"/>
            <text x="50%" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#002395">DP1 - PLAN DE SITUATION</text>
            <text x="50%" y="70" font-family="Arial" font-size="14" text-anchor="middle" fill="#64748b">{address}, {cp} {city}</text>
            
            <!-- Cadre du plan -->
            <rect x="50" y="100" width="700" height="450" fill="white" stroke="#002395" stroke-width="2"/>
            
            <!-- Trame de rues simulée -->
            <path d="M 100 150 L 700 150 M 100 350 L 700 350 M 250 100 L 250 550 M 550 100 L 550 550" stroke="#e2e8f0" stroke-width="20"/>
            
            <!-- Indication de la parcelle -->
            <circle cx="250" cy="350" r="10" fill="red" stroke="white" stroke-width="2"/>
            <text x="270" y="340" font-family="Arial" font-size="12" font-weight="bold" fill="red">PROJET</text>
            
            <!-- Rose des vents -->
            <g transform="translate(700, 150)">
                <line x1="0" y1="-30" x2="0" y2="30" stroke="#002395" stroke-width="2"/>
                <line x1="-30" y1="0" x2="30" y2="0" stroke="#002395" stroke-width="2"/>
                <text x="0" y="-35" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle">N</text>
            </g>
            
            <text x="60" y="530" font-family="Arial" font-size="10" fill="#94a3b8">Source: Urbania Intelligent Mapping</text>
            <text x="650" y="530" font-family="Arial" font-size="10" fill="#94a3b8">Échelle: 1/2000</text>
        </svg>
        """
        return svg

    @classmethod
    def generate_dp2_svg(cls, data):
        """Génère un SVG pour le DP2 (Plan de masse) basé sur les dimensions réelles."""
        surf_terrain = data.get('surfaceTerrain', 100)
        surf_creee = data.get('empriseSolCreee', 20)
        
        # Calculs simplifiés pour le dessin
        box_size = 400
        padding = 50
        
        # On dessine une parcelle
        svg = f"""
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8fafc"/>
            <text x="50%" y="40" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="#002395">DP2 - PLAN DE MASSE</text>
            
            <g transform="translate(200, 100)">
                <!-- Parcelle -->
                <rect x="0" y="0" width="{box_size}" height="{box_size}" fill="white" stroke="#1e293b" stroke-width="2"/>
                <text x="10" y="20" font-family="Arial" font-size="10" fill="#64748b">Parcelle {data.get('section', '')}{data.get('numeroParcelle', '')}</text>
                
                <!-- Projet -->
                <rect x="150" y="150" width="100" height="100" fill="#002395" fill-opacity="0.2" stroke="#002395" stroke-width="2" stroke-dasharray="5,5"/>
                <text x="160" y="205" font-family="Arial" font-size="12" font-weight="bold" fill="#002395">PROJET</text>
                <text x="160" y="220" font-family="Arial" font-size="10" fill="#002395">{surf_creee}m²</text>
                
                <!-- Cotes -->
                <line x1="150" y1="130" x2="250" y2="130" stroke="#64748b" stroke-width="1"/>
                <text x="200" y="125" font-family="Arial" font-size="10" text-anchor="middle">L=10m</text>
            </g>
            
            <!-- Légende -->
            <rect x="620" y="100" width="150" height="100" fill="white" stroke="#e2e8f0" rx="8"/>
            <text x="630" y="120" font-family="Arial" font-size="12" font-weight="bold">Légende</text>
            <rect x="630" y="135" width="15" height="15" fill="#002395" fill-opacity="0.2" stroke="#002395"/>
            <text x="655" y="147" font-family="Arial" font-size="10">Construction projetée</text>
            
            <text x="50%" y="580" font-family="Arial" font-size="10" text-anchor="middle" fill="#94a3b8">Note: Plan généré automatiquement pour l'instruction du dossier.</text>
        </svg>
        """
        return svg
