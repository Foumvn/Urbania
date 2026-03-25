import os
import requests
import json
import base64
import asyncio
from dotenv import load_dotenv
from .cadastre_puppeteer_service import CadastrePuppeteerService
from .prompt_templates import build_prompt_from_template, get_project_type, normalize_data

load_dotenv()

class DPGeneratorService:
    # Configuration des modes d'exécution (Legacy support)
    _execution_mode = os.getenv("DP_GENERATOR_MODE", "standard")
    
    @classmethod
    def get_execution_mode(cls):
        """Retourne le mode d'exécution actuel"""
        return cls._execution_mode
    
    @classmethod
    def set_execution_mode(cls, mode):
        """Définit le mode d'exécution: 'standard', 'light'"""
        if mode not in ['standard', 'light']:
            raise ValueError("Mode d'exécution invalide. Choisissez: 'standard', 'light'")
        cls._execution_mode = mode
        print(f"🔄 Mode d'exécution changé: {mode}")
    
    @staticmethod
    def generate_plan(data, plan_type, provider="GEMINI"):
        """
        Génère un plan DP basé sur les données du projet en utilisant GEMINI exclusivement (Nano Banana Style).
        data: Dict contenant les infos du projet
        plan_type: 'dp1', 'dp2', 'dp3', 'dp4', 'dp5', 'dp6'
        provider: 'GEMINI' (Seul provider supporté désormais)
        """
        
        if plan_type == 'dp1':
            # DP1 utilise les APIs cadastrales officielles
            print(f"Génération {plan_type} via API Cadastre...")
            
            commune = data.get('terrainVille', '').strip()
            section = data.get('sectionCadastrale', '').strip()
            parcelle = data.get('numeroParcelle', '').strip()
            
            if not commune or not section or not parcelle:
                raise ValueError("Infos cadastrales manquantes pour le DP1")
            
            try:
                image_base64 = asyncio.run(CadastrePuppeteerService.generate_cadastre_image(commune, section, parcelle))
                return {
                    "image": image_base64,
                    "format": "image/png",
                    "provider": "OFFICIAL_CADASTRE"
                }
            except Exception as e:
                raise Exception(f"Erreur plan cadastral: {str(e)}")
        
        elif plan_type in ['dp2', 'dp3', 'dp4', 'dp5', 'dp6']:
            # Normalisation des données utilisateur (gestion "longueure", "larger", etc.)
            normalized_data = normalize_data(data)
            full_prompt = build_prompt_from_template(plan_type, normalized_data)
        else:
            raise ValueError(f"Type de plan non supporté: {plan_type}")

        # On force GEMINI (Nano Banana) pour tous les autres plans techniques
        print(f"Génération {plan_type} via GEMINI (RAS Style)...")
        return DPGeneratorService._generate_gemini(full_prompt, plan_type)

    @staticmethod
    def _generate_gemini(prompt, plan_type):
        """Génération via OpenRouter Gemini - Alignement sur RAS Style"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY manquant")

        # Modèle spécifique utilisé dans le mini-projet RAS
        model = "google/gemini-3-pro-image-preview"
        referer = os.getenv("OPENROUTER_SITE_URL", "http://localhost:3000")
        app_name = os.getenv("OPENROUTER_APP_NAME", "Urbania App")

        payload = {
            "model": model,
            "max_tokens": 2048, # Avoid 402 errors (insufficient credits for default high token request)
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": referer,
            "X-Title": app_name
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=180
            )

            if response.status_code >= 400:
                try:
                    err_json = response.json()
                    msg = err_json.get("error", {}).get("message", response.text)
                except:
                    msg = response.text
                
                # Message spécifique pour les crédits
                if response.status_code == 402:
                    msg = "Crédits OpenRouter insuffisants. Veuillez recharger votre compte."
                
                raise Exception(f"OpenRouter Error {response.status_code}: {msg}")

            data = response.json()
            choices = data.get("choices")
            if not choices:
                raise ValueError("Réponse Gemini invalide (choices manquant)")

            result = choices[0].get("message", {})
            
            # Extraction de l'URL ou du base64 (Logique RAS)
            image_url = None
            images = result.get("images", [])
            if images and len(images) > 0:
                image_url = images[0].get("image_url", {}).get("url")
            
            if not image_url:
                image_url = result.get("content")

            if not image_url:
                raise ValueError("Aucune image générée par Gemini")

            # Résolution de la référence (Téléchargement ou Base64)
            base64_image = DPGeneratorService._resolve_image_reference(image_url)

            if not base64_image:
                raise ValueError("Échec résolution image Gemini")

            return {
                "image": base64_image,
                "format": "image/png",
                "provider": "GEMINI_NANO_BANANA"
            }
        except Exception as e:
            # On log l'erreur pour le debug serveur
            print(f"ERROR: Plan generation failed: {str(e)}")
            raise e

    @staticmethod
    def _resolve_image_reference(reference):
        if not reference:
            return None

        # Base64 standard (data:image/...)
        if reference.startswith("data:image"):
            try:
                return reference.split(",", 1)[1]
            except Exception:
                return reference
        
        # Base64 brut
        if not reference.startswith("http") and len(reference) > 100:
            return reference

        # URL
        if reference.startswith("http"):
            resp = requests.get(reference, timeout=120)
            if resp.status_code >= 400:
                raise Exception(f"Téléchargement image échoué ({resp.status_code})")
            return base64.b64encode(resp.content).decode()

        return None
