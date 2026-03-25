import re
import requests
import json
import logging
import os
from urllib.parse import quote as url_quote
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
    def generate_notice_descriptive(cls, project_data):
        """Génère la notice descriptive complète (DP11)."""
        nature_travaux = project_data.get('natureTravaux', [])
        if isinstance(nature_travaux, str):
            nature_travaux = [nature_travaux]
        
        is_piscine = any('piscine' in n.lower() for n in nature_travaux)
        
        base_info = f"""
        Rédige une notice descriptive (DP11) pour un dossier de déclaration préalable d'urbanisme.
        
        INFORMATIONS DU TERRAIN :
        - Adresse : {project_data.get('terrainNumero', '')} {project_data.get('terrainAdresse', '')}, {project_data.get('terrainCodePostal', '')} {project_data.get('terrainVille', 'Inconnue')}
        - Section cadastrale : {project_data.get('section', 'Non renseignée')}
        - Parcelle : {project_data.get('numeroParcelle', 'Non renseignée')}
        - Surface terrain : {project_data.get('surfaceTerrain', 'Non renseignée')} m²
        
        INFORMATIONS DU PROJET :
        - Nature des travaux : {', '.join(nature_travaux) if nature_travaux else 'Non renseignée'}
        - Description : {project_data.get('descriptionProjet', 'Non renseignée')}
        - Destination : {project_data.get('destination', 'Non renseignée')}
        
        INFORMATIONS CONSTRUCTION (si applicable) :
        - Hauteur : {project_data.get('hauteurConstruction', 'Non renseignée')} m
        - Emprise au sol créée : {project_data.get('empriseSolCreee', 'Non renseignée')} m²
        - Surface plancher créée : {project_data.get('surfacePlancherCreee', 'Non renseignée')} m²
        - Matériaux façade : {project_data.get('materiauFacade', 'Non renseigné')} ({project_data.get('couleurFacade', 'Non renseignée')})
        - Matériaux toiture : {project_data.get('materiauToiture', 'Non renseigné')} ({project_data.get('couleurToiture', 'Non renseignée')})
        """
        
        piscine_info = ""
        if is_piscine:
            piscine_info = f"""
        
        INFORMATIONS PISCINE :
        - Type : {'Piscine couverte' if project_data.get('piscineCouverte') else 'Piscine non couverte'}
        - Dimensions : {project_data.get('longueurPiscine', 'Non renseignée')} m x {project_data.get('largeurPiscine', 'Non renseignée')} m
        - Surface du bassin : {project_data.get('surfaceBassin', 'Non renseignée')} m²
        - Profondeur moyenne : {project_data.get('profondeurMoyenne', 'Non renseignée')} m
        - Dispositif de sécurité : {project_data.get('dispositifSecurite', 'Non renseigné')}
        """
        
        cloture_info = ""
        if any('cloture' in n.lower() for n in nature_travaux):
            cloture_info = f"""
        
        INFORMATIONS CLÔTURE :
        - Hauteur maximale : {project_data.get('hauteurMax', 'Non renseignée')} m
        - Matériau : {project_data.get('materiauCloture', 'Non renseigné')}
        - Linéaire total : {project_data.get('lineaireTotal', 'Non renseigné')} m
        - Inclut portail : {'Oui' if project_data.get('includePortail') else 'Non'}
        """
        
        prompt = f"""{base_info}{piscine_info}{cloture_info}
        
        La notice doit comporter {('4' if is_piscine else '3')} parties distinctes :
        1. Présentation de l'état initial du terrain et des constructions existantes.
        2. Description précise du projet (volume, implantation, matériaux).
        3. Analyse de l'insertion dans l'environnement proche et lointain.
        {"4. Spécificités de l'installation piscinière (sécurité, raccordements, dispositif de protection)." if is_piscine else ""}
        
        RÈGLES :
        - Langage professionnel (architectural).
        - Remplace les "Non renseignée" par des formulations naturelles (ex: "non précisée", "à déterminer").
        - Pas de gras (**), texte brut structuré.
        - Ton factuel et précis.
        - Utilise UNIQUEMENT les informations fournies ci-dessus.
        - Environ 250 à 400 mots.
        """
        response_text = cls.call_mistral(prompt, is_json=False)
        if response_text:
            return response_text.replace('*', '').strip()
        return "Notice descriptive à rédiger..."

    @classmethod
    def _get_commune_insee(cls, commune_name):
        """Récupère le code INSEE via geo.api.gouv.fr."""
        try:
            resp = requests.get(
                f"https://geo.api.gouv.fr/communes?nom={url_quote(commune_name)}&fields=code,nom&format=json&limit=5",
                timeout=8
            )
            if resp.ok:
                communes = resp.json()
                if communes:
                    exact = next((c for c in communes if c['nom'].lower() == commune_name.lower()), None)
                    return (exact or communes[0]).get('code')
        except Exception as e:
            logger.warning(f"Erreur INSEE pour '{commune_name}': {e}")
        return None

    @classmethod
    def _get_plu_gpu_zones(cls, insee):
        """Récupère les zones PLU officielles via apicarto.ign.fr (GPU)."""
        try:
            resp = requests.get(
                f"https://apicarto.ign.fr/api/gpu/zone-urba?code_insee={insee}",
                timeout=15
            )
            if resp.ok:
                data = resp.json()
                zones = []
                for feat in data.get('features', [])[:8]:
                    props = feat.get('properties', {})
                    zones.append({
                        'type': props.get('typezone', '?'),
                        'libelle': props.get('libelle', '?'),
                        'destdomi': props.get('destdomi', ''),
                        'urlfic': props.get('urlfic', '')
                    })
                return zones
        except Exception as e:
            logger.warning(f"Erreur GPU zone-urba INSEE={insee}: {e}")
        return []

    @classmethod
    def _get_plu_document_info(cls, insee):
        """Récupère les informations sur le document PLU approuvé."""
        try:
            resp = requests.get(
                f"https://apicarto.ign.fr/api/gpu/document?code_insee={insee}",
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                features = data.get('features', [])
                if features:
                    props = features[0].get('properties', {})
                    return {
                        'type': props.get('typedoc', ''),
                        'date': props.get('dateappro', ''),
                        'nom': props.get('nomdoc', ''),
                        'url': props.get('urlfic', '')
                    }
        except Exception as e:
            logger.warning(f"Erreur GPU document INSEE={insee}: {e}")
        return None

    @classmethod
    def _search_plu_web(cls, commune, description, max_snippets=6):
        """Recherche web DuckDuckGo pour les règles PLU de la commune."""
        try:
            query = f"PLU {commune} règlement zone urbanisme {description or 'construction'}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
                'Accept-Language': 'fr-FR,fr;q=0.9',
            }
            resp = requests.get(
                f"https://html.duckduckgo.com/html/?q={url_quote(query)}&kl=fr-fr",
                headers=headers,
                timeout=12
            )
            if not resp.ok:
                return []

            html = resp.text

            def clean_html(text):
                text = re.sub(r'<[^>]+>', '', text)
                text = re.sub(r'&(?:amp|quot|lt|gt|nbsp|#\d+);', ' ', text)
                return re.sub(r'\s+', ' ', text).strip()

            snippets = re.findall(r'class="result__snippet"[^>]*>(.*?)</(?:a|span)>', html, re.DOTALL)
            titles = re.findall(r'class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL)

            results = []
            for title, snippet in zip(titles[:max_snippets], snippets[:max_snippets]):
                t = clean_html(title)
                s = clean_html(snippet)
                if s and len(s) > 25:
                    results.append(f"• {t}\n  {s}")
            return results
        except Exception as e:
            logger.warning(f"Erreur recherche web PLU '{commune}': {e}")
            return []

    @classmethod
    def analyze_plu(cls, commune, section, parcelle, description):
        """Analyse le PLU en combinant données officielles GPU + recherche web + Mistral."""

        # ── 1. Données officielles ──────────────────────────────────────
        insee = cls._get_commune_insee(commune)
        logger.info(f"INSEE pour '{commune}': {insee}")

        gpu_zones = cls._get_plu_gpu_zones(insee) if insee else []
        plu_doc   = cls._get_plu_document_info(insee) if insee else None

        # ── 2. Recherche web ────────────────────────────────────────────
        web_snippets = cls._search_plu_web(commune, description)

        # ── 3. Analyse des données récupérées ────────────────────────────
        sources = []
        analysis_data = {
            "zone_urba": "Ua / Ub",  # Valeur par défaut
            "zone_description": "Zone urbaine résidentielle",
            "hauteur_max": "9 à 12 m selon secteur",
            "emprise_sol": "40 à 60% selon secteur",
            "retraits": "3 m façade, 2 m côtés, 3 m fond",
            "stationnement": "1 place/85 m² habitable",
            "espaces_verts": "30% pleine terre minimum",
            "documents_reference": ["PLU de la commune"],
            "risques": ["À vérifier auprès de la mairie"],
            "cautions": ["Consulter le PLU communal pour confirmation"],
            "recommandations": ["Faire une demande de certificat d'urbanisme"],
            "demarche_admin": "Déclaration préalable pour surfaces < 100 m²",
        }

        # Valeurs spécifiques par commune
        commune_defaults = {
            'bordeaux': {
                'zone_urba': 'Ua / Ub',
                'zone_description': 'Zone urbaine mixte avec vocation résidentielle et commerciale',
                'hauteur_max': '9 à 12 m selon secteur',
                'emprise_sol': '50% maximum',
                'retraits': '3 m façade, 2 m côtés, 3 m fond',
                'stationnement': '1 place/85 m² habitable',
                'espaces_verts': '30% pleine terre minimum'
            }
        }

        commune_lower = commune.lower().strip()
        if commune_lower in commune_defaults:
            analysis_data.update(commune_defaults[commune_lower])

        # Extraction des zones PLU IGN
        if gpu_zones:
            sources.append("Géoportail Urbanisme IGN (apicarto.ign.fr)")
            # Prendre la première zone comme principale
            main_zone = gpu_zones[0]
            analysis_data["zone_urba"] = main_zone.get('type', 'U')
            analysis_data["zone_description"] = f"Zone {main_zone.get('type', 'U')} : {main_zone.get('libelle', 'Zone urbaine')} - {main_zone.get('destdomi', 'usage mixte')}"

        # Extraction du document PLU
        if plu_doc:
            doc_info = f"PLU approuvé le {plu_doc.get('date', 'date inconnue')}"
            if plu_doc.get('url'):
                doc_info += f" (document officiel disponible)"
                sources.append(plu_doc['url'])
            analysis_data["documents_reference"].append(doc_info)

        # Extraction des règles web
        web_rules = []
        if web_snippets:
            sources.append("Recherche web (DuckDuckGo)")
            for snippet in web_snippets[:3]:  # Limiter à 3 snippets
                snippet_lower = snippet.lower()
                # Extraction hauteur
                if 'hauteur' in snippet_lower and ('m' in snippet_lower or 'r+' in snippet_lower):
                    if 'hauteur maximale' not in analysis_data["hauteur_max"]:
                        analysis_data["hauteur_max"] = snippet[:100] + "..."
                # Extraction emprise
                if 'emprise' in snippet_lower and '%' in snippet:
                    if 'emprise au sol maximale' not in analysis_data["emprise_sol"]:
                        analysis_data["emprise_sol"] = snippet[:100] + "..."
                # Extraction retraits
                if 'retrait' in snippet_lower or 'distance' in snippet_lower:
                    if 'distances minimales' not in analysis_data["retraits"]:
                        analysis_data["retraits"] = snippet[:100] + "..."

        # Règles spécifiques au projet piscine
        if description and 'piscine' in description.lower():
            analysis_data["demarche_admin"] = "Déclaration préalable si surface < 100 m², permis de construire si > 100 m²"
            analysis_data["cautions"].append("Dispositif de sécurité piscine obligatoire (barrière, alarme, couverture)")
            analysis_data["cautions"].append("Couleurs du bassin : nuances de gris, bleu ou vert autorisées")
            analysis_data["cautions"].append("Distances aux limites séparatives à respecter")
            analysis_data["recommandations"].append("Vérifier raccordements eau/électricité")

        # ── 4. Génération du texte narratif avec Mistral ─────────────────
        context_summary = ""
        if gpu_zones:
            context_summary += f"Zones PLU officielles IGN : {len(gpu_zones)} zones identifiées. "
        if web_snippets:
            context_summary += f"Informations web : {len(web_snippets)} sources consultées. "
        if not context_summary:
            context_summary = "Aucune donnée externe spécifique récupérée."

        prompt_narratif = f"""
En tant qu'expert en urbanisme français, rédige un rapport narratif complet (4-6 paragraphes) sur le PLU de {commune} pour un projet de {description or 'construction'}.

Contexte des données récupérées : {context_summary}

Structure le rapport :
1. Zonage et vocation de la commune
2. Règles d'urbanisme applicables (hauteur, emprise, retraits, stationnement)
3. Points de vigilance spécifiques au projet
4. Démarche administrative et délais
5. Recommandations pratiques

Utilise un langage professionnel et factuel. Réponds uniquement avec le texte narratif, sans introduction.
"""

        narrative_text = ""
        try:
            mistral_response = cls.call_mistral(prompt_narratif, is_json=False)
            if mistral_response:
                narrative_text = mistral_response.strip()
        except Exception as e:
            logger.warning(f"Erreur génération narratif Mistral: {e}")

        if not narrative_text:
            narrative_text = f"Analyse du PLU de {commune}. La commune est soumise à un plan local d'urbanisme qui réglemente l'urbanisation. Pour ce projet de {description or 'construction'}, les principales contraintes concernent l'emprise au sol, les hauteurs constructibles et les retraits par rapport aux limites séparatives. La démarche administrative requiert généralement une déclaration préalable pour les projets de surface modérée. Il est fortement recommandé de consulter le service urbanisme de la commune pour obtenir des informations précises et à jour."

        # ── 5. Construction de la réponse finale ──────────────────────────
        analysis_data["sources_consultees"] = sources
        analysis_data["analyse_detaillee"] = narrative_text

        return analysis_data
