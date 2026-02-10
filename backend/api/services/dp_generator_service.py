import os
import requests
import json
import base64
import time
import io
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

class DPGeneratorService:
    @staticmethod
    def generate_plan(data, plan_type, provider="HUGGINGFACE"):
        """
        Generates a DP plan based on project data using Hugging Face (FLUX.1-schnell).
        data: Dict containing project info (natureTravaux, descriptionProjet, materials, dimensions...)
        plan_type: 'dp2', 'dp3', 'dp4'
        """
        
        # 1. Construct Prompt based on Data
        nature_list = data.get('natureTravaux', [])
        if isinstance(nature_list, list) and len(nature_list) > 0:
            nature = nature_list[0]
        elif isinstance(nature_list, str) and nature_list:
            nature = nature_list
        else:
            nature = 'projet'
        
        description = data.get('descriptionProjet', '')
        
        # Extract materials/colors if available
        materiaux = []
        if data.get('materiauFacade'): materiaux.append(f"Façade: {data.get('materiauFacade')} ({data.get('couleurFacade', '')})")
        if data.get('materiauToiture'): materiaux.append(f"Toiture: {data.get('materiauToiture')} ({data.get('couleurToiture', '')})")
        mat_str = ", ".join(materiaux)
        
        # Dimensions
        dims = []
        if data.get('surfaceTheorique'): dims.append(f"Surface: {data.get('surfaceTheorique')}m²")
        if data.get('hauteurConstruction'): dims.append(f"Hauteur: {data.get('hauteurConstruction')}m")
        dim_str = ", ".join(dims)

        base_prompt = f"Projet de {nature}. Description: {description}. Matériaux: {mat_str}. Dimensions: {dim_str}."

        # Professional Style Prompts for Hugging Face (Flux)
        style_dp2 = "Architectural site plan (DP2), professional top-down cadastral view, precise plot boundaries, roof outlines, landscape layout. Technical black linework on white background, no perspective, 2D orthographic projection. Includes orientation arrows, plot numbers, and site dimensioning lines. Clean CAD aesthetics, minimalist, no shading. New construction areas highlighted with subtle green hatching."
        style_dp3 = "Professional 2D CAD vector drawing, technical architectural section (DP3), schematic line art. Strictly black thin lines on a solid bleach-white background. No 3D effects, no realistic textures. Use simple diagonal line hatching for wall sections. Perfect 2D orthographic projection. Includes thin dimension lines and level markers. Zero shading, zero gradients, zero gray tones."
        style_dp4 = "Architectural elevation drawing (DP4 - Façades), technical line art front view. Front view of the project. Roof and wall textures indicated by technical patterns. Strictly black thin lines on a solid white background. Professional drafting style. No 3D, no perspective."

        if plan_type == 'dp1':
            full_prompt = f"{base_prompt}, {style_dp2}"
        elif plan_type == 'dp2':
            full_prompt = f"{base_prompt}, {style_dp2}" # Also use site plan style for DP2 as requested
        elif plan_type == 'dp3':
            full_prompt = f"{base_prompt}, {style_dp3}"
        elif plan_type == 'dp4':
            full_prompt = f"{base_prompt}, {style_dp4}"
        else:
            raise ValueError("Type de plan non supporté")

        print(f"Generating {plan_type} via HUGGINGFACE with prompt: {full_prompt[:100]}...")

        # 2. Call Hugging Face
        try:
            return DPGeneratorService._generate_hf(full_prompt)
        except Exception as e:
            print(f"Erreur critique de génération HF: {e}")
            raise e

    @staticmethod
    def _generate_hf(prompt):
        # Retrieve all available keys
        keys = []
        k1 = os.getenv("HUGGINGFACE_API_KEY")
        k2 = os.getenv("HUGGINGFACE_API_KEY_2")
        if k1: keys.append(k1)
        if k2: keys.append(k2)

        if not keys:
            raise ValueError("Aucune clé API HuggingFace trouvée (ni HUGGINGFACE_API_KEY, ni HUGGINGFACE_API_KEY_2)")

        model_id = "black-forest-labs/FLUX.1-schnell"
        last_error = None

        for api_key in keys:
            masked_key = f"{api_key[:4]}...{api_key[-4:]}"
            print(f"DEBUG: Tentative HF avec la clé {masked_key}")

            try:
                # 1. Try with inference library first
                client = InferenceClient(token=api_key)
                image = client.text_to_image(
                    prompt, 
                    model=model_id,
                    width=1024,
                    height=1024,
                    num_inference_steps=4,
                    guidance_scale=0.0
                )
                
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                return {
                    "image": img_str,
                    "format": "image/png",
                    "provider": "HUGGINGFACE"
                }

            except Exception as e:
                print(f"DEBUG HF Lib Error avec {masked_key}: {e}")
                # 2. Fallback to direct API request
                try:
                    API_URL = f"https://api-inference.huggingface.co/models/{model_id}"
                    headers = {"Authorization": f"Bearer {api_key}"}
                    response = requests.post(API_URL, headers=headers, json={"inputs": prompt})
                    
                    if response.status_code == 200:
                        img_str = base64.b64encode(response.content).decode()
                        return {
                            "image": img_str,
                            "format": "image/png",
                            "provider": "HUGGINGFACE"
                        }
                    elif response.status_code in [429, 503]:
                        print(f"WARN: Quota/Busy ({response.status_code}) avec la clé {masked_key}. Essai suivante...")
                        last_error = f"Quota/Busy {response.status_code}"
                        continue # Try next key
                    else:
                        print(f"ERROR: HF API returned {response.status_code}: {response.text}")
                        last_error = f"HTTP {response.status_code}"

                except Exception as nested_e:
                    print(f"DEBUG HF Direct API Error avec {masked_key}: {nested_e}")
                    last_error = str(nested_e)
        
        # If we reach here, all keys failed
        raise Exception(f"Tous les tokens Hugging Face ont échoué. Dernière erreur: {last_error}")
