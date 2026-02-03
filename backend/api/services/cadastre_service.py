"""
Service pour l'API Cadastre officielle française.

APIs utilisées:
- cadastre.data.gouv.fr (Etalab) - Données GeoJSON des parcelles et bâtiments
- apicarto.ign.fr - Recherche par commune et parcelle
- api-adresse.data.gouv.fr - Géocodage d'adresses
"""

import requests
import logging
from typing import Optional, Dict, Any, List
from functools import lru_cache

logger = logging.getLogger(__name__)

# URLs des APIs officielles
CADASTRE_ETALAB_BASE = "https://cadastre.data.gouv.fr/data/etalab-cadastre/latest/geojson/communes"
APICARTO_BASE = "https://apicarto.ign.fr/api/cadastre"
API_ADRESSE_BASE = "https://api-adresse.data.gouv.fr"


class CadastreService:
    """Service pour interagir avec l'API Cadastre officielle."""
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Urbania-DP-Platform/1.0',
            'Accept': 'application/json'
        })
    
    def get_parcelles_commune(self, code_insee: str) -> Dict[str, Any]:
        """
        Récupère toutes les parcelles d'une commune.
        
        Args:
            code_insee: Code INSEE de la commune (ex: '75056' pour Paris)
            
        Returns:
            GeoJSON FeatureCollection des parcelles
        """
        # Normaliser le code INSEE (5 caractères)
        code_insee = code_insee.zfill(5)
        
        # Construire l'URL Etalab
        url = f"{CADASTRE_ETALAB_BASE}/{code_insee}/cadastre-{code_insee}-parcelles.json"
        
        try:
            logger.info(f"Fetching parcelles for commune {code_insee}")
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                logger.warning(f"Commune {code_insee} not found in cadastre")
                return {"type": "FeatureCollection", "features": []}
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching parcelles: {e}")
            raise
    
    def get_batiments_commune(self, code_insee: str) -> Dict[str, Any]:
        """
        Récupère tous les bâtiments d'une commune.
        
        Args:
            code_insee: Code INSEE de la commune
            
        Returns:
            GeoJSON FeatureCollection des bâtiments
        """
        code_insee = code_insee.zfill(5)
        url = f"{CADASTRE_ETALAB_BASE}/{code_insee}/cadastre-{code_insee}-batiments.json"
        
        try:
            logger.info(f"Fetching batiments for commune {code_insee}")
            response = self.session.get(url, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return {"type": "FeatureCollection", "features": []}
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching batiments: {e}")
            raise
    
    def get_parcelle_by_id(self, code_insee: str, section: str, numero: str) -> Optional[Dict[str, Any]]:
        """
        Récupère une parcelle spécifique via APICarto.
        
        Args:
            code_insee: Code INSEE de la commune
            section: Section cadastrale (ex: 'AB')
            numero: Numéro de parcelle (ex: '0123')
            
        Returns:
            GeoJSON Feature de la parcelle ou None
        """
        code_insee = code_insee.zfill(5)
        section = section.upper().strip()
        numero = numero.zfill(4)
        
        url = f"{APICARTO_BASE}/parcelle"
        params = {
            'code_insee': code_insee,
            'section': section,
            'numero': numero
        }
        
        try:
            url_full = f"{url}?code_insee={code_insee}&section={section}&numero={numero}"
            logger.info(f"Fetching parcelle from APICarto: {url_full}")
            response = self.session.get(url, params=params, timeout=self.timeout)
            logger.info(f"APICarto response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"APICarto error response: {response.text}")
                
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                return data['features'][0]
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching parcelle: {e}")
            return None
    
    def search_parcelles(self, code_insee: str, section: Optional[str] = None) -> Dict[str, Any]:
        """
        Recherche des parcelles via APICarto.
        
        Args:
            code_insee: Code INSEE de la commune
            section: Section cadastrale (optionnel)
            
        Returns:
            GeoJSON FeatureCollection
        """
        code_insee = code_insee.zfill(5)
        
        url = f"{APICARTO_BASE}/parcelle"
        params = {'code_insee': code_insee}
        
        if section:
            params['section'] = section.upper().strip()
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching parcelles: {e}")
            return {"type": "FeatureCollection", "features": []}
    
    def geocode_address(self, address: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Géocode une adresse pour obtenir les coordonnées et le code INSEE.
        
        Args:
            address: Adresse à géocoder
            limit: Nombre max de résultats
            
        Returns:
            Liste de résultats avec coordonnées et métadonnées
        """
        url = f"{API_ADRESSE_BASE}/search/"
        params = {
            'q': address,
            'limit': limit
        }
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for feature in data.get('features', []):
                props = feature.get('properties', {})
                coords = feature.get('geometry', {}).get('coordinates', [])
                
                results.append({
                    'label': props.get('label', ''),
                    'city': props.get('city', ''),
                    'citycode': props.get('citycode', ''),  # Code INSEE
                    'postcode': props.get('postcode', ''),
                    'street': props.get('street', ''),
                    'housenumber': props.get('housenumber', ''),
                    'longitude': coords[0] if len(coords) > 0 else None,
                    'latitude': coords[1] if len(coords) > 1 else None,
                    'score': props.get('score', 0)
                })
            
            return results
        except requests.exceptions.RequestException as e:
            logger.error(f"Error geocoding address: {e}")
            return []
    
    def reverse_geocode(self, lon: float, lat: float) -> Optional[Dict[str, Any]]:
        """
        Géocodage inverse: coordonnées -> adresse et code INSEE.
        
        Args:
            lon: Longitude
            lat: Latitude
            
        Returns:
            Informations sur l'adresse
        """
        url = f"{API_ADRESSE_BASE}/reverse/"
        params = {
            'lon': lon,
            'lat': lat
        }
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                feature = data['features'][0]
                props = feature.get('properties', {})
                return {
                    'label': props.get('label', ''),
                    'city': props.get('city', ''),
                    'citycode': props.get('citycode', ''),
                    'postcode': props.get('postcode', ''),
                }
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error reverse geocoding: {e}")
            return None

    def get_parcelle_by_coordinates(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Trouve la parcelle correspondant à des coordonnées GPS.
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            GeoJSON Feature de la parcelle
        """
        import json
        url = f"{APICARTO_BASE}/parcelle"
        geom = {
            "type": "Point",
            "coordinates": [lon, lat]
        }
        params = {'geom': json.dumps(geom)}
        
        try:
            logger.info(f"Searching parcelle by coordinates: [{lon}, {lat}]")
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                logger.info(f"Found parcelle: {data['features'][0].get('properties', {}).get('id')}")
                return data['features'][0]
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching parcelle by coordinates: {e}")
            return None
    
    def get_sections_commune(self, code_insee: str) -> List[str]:
        """
        Récupère la liste des sections cadastrales d'une commune.
        
        Args:
            code_insee: Code INSEE de la commune
            
        Returns:
            Liste des sections (ex: ['A', 'AB', 'AC', ...])
        """
        url = f"{APICARTO_BASE}/division"
        params = {'code_insee': code_insee.zfill(5)}
        
        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            sections = set()
            for feature in data.get('features', []):
                section = feature.get('properties', {}).get('section')
                if section:
                    sections.add(section)
            
            return sorted(list(sections))
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching sections: {e}")
            return []


# Instance singleton pour réutilisation
cadastre_service = CadastreService()
