import threading
import time
import requests
import os
import logging

logger = logging.getLogger(__name__)

def ping_self():
    """
    Boucle de maintien en éveil pour Render.
    Pinge l'URL du serveur toutes les 14 minutes.
    """
    url = os.environ.get('RENDER_EXTERNAL_URL')
    if not url:
        logger.warning("RENDER_EXTERNAL_URL non défini. La boucle de keep-alive est désactivée.")
        return

    logger.info(f"Démarrage de la boucle keep-alive pour : {url}")
    
    # Attendre que le serveur soit prêt (30 secondes)
    time.sleep(30)
    
    while True:
        try:
            response = requests.get(url)
            logger.info(f"Keep-alive ping réussi : {response.status_code}")
        except Exception as e:
            logger.error(f"Erreur lors du ping keep-alive : {e}")
        
        # Attendre 14 minutes (Render dort après 15 min d'inactivité)
        time.sleep(14 * 60)

def start_keep_alive():
    """
    Lance la boucle keep-alive dans un thread séparé.
    """
    if os.environ.get('RENDER'): # Uniquement sur Render
        thread = threading.Thread(target=ping_self, daemon=True)
        thread.start()
