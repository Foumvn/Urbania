import os
import base64
from subprocess import Popen, PIPE
import json
import tempfile
import asyncio

class CadastrePuppeteerService:
    
    @staticmethod
    async def generate_cadastre_image(commune, section, parcelle):
        """
        Lance votre application cadastre en headless
        et capture l'image générée
        """
        
        # 1. Créer un script Node.js temporaire
        script_content = CadastrePuppeteerService._create_puppeteer_script(
            commune, section, parcelle
        )
        
        # 2. Sauvegarder le script
        script_path = os.path.join(tempfile.gettempdir(), 'capture_cadastre.js')
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        # 3. Exécuter le script Node.js
        # On s'assure d'être dans le dossier backend pour trouver node_modules si besoin
        # ou on laisse node le trouver globalement/dans le CWD
        process = Popen(
            ['node', script_path],
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Erreur Puppeteer: {stderr.decode()}")
        
        try:
            # 4. Récupérer l'image en base64
            result = json.loads(stdout.decode())
            image_base64 = result['image']
            
            # 5. Nettoyer
            if os.path.exists(script_path):
                os.remove(script_path)
            
            return image_base64
        except Exception as e:
            raise Exception(f"Erreur lors de la lecture du résultat Puppeteer: {str(e)}. Output: {stdout.decode()}")
    
    @staticmethod
    def _create_puppeteer_script(commune, section, parcelle):
        """
        Génère le script Puppeteer qui va :
        1. Ouvrir votre page cadastre
        2. Remplir le formulaire
        3. Attendre le rendu
        4. Capturer l'image
        """
        
        # URL de votre app cadastre (en local ou déployée)
        # On essaie d'abord 5174 ou un autre port si 5173 est pris par le frontend principal
        # Mais l'utilisateur a spécifié 5173. On va rester sur ça par défaut.
        cadastre_url = os.getenv("CADASTRE_URL", "http://localhost:5173")
        
        script = f"""
const puppeteer = require('puppeteer-core');

(async () => {{
    let browser;
    try {{
        browser = await puppeteer.launch({{
            executablePath: '/usr/bin/google-chrome',
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }});
        
        const page = await browser.newPage();
        
        // Taille de la fenêtre (correspond à votre carte)
        await page.setViewport({{
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2  // Haute résolution
        }});
        
        // Ouvrir votre application cadastre
        await page.goto('{cadastre_url}', {{
            waitUntil: 'networkidle0',
            timeout: 60000
        }});
        
        // Attendre que la carte soit chargée
        await page.waitForSelector('#map', {{ timeout: 30000 }});
        
        // Remplir le formulaire
        await page.type('#commune-input', '{commune}');
        await page.type('#section-input', '{section}');
        await page.type('#parcel-input', '{parcelle}');
        
        // Cliquer sur Rechercher
        await page.click('#search-btn');
        
        // Attendre que la parcelle soit affichée avec le cadre vert
        // On attend que les requêtes réseau se calment après le clic
        await new Promise(r => setTimeout(r, 6000));
        
        // Cacher les panneaux UI
        await page.evaluate(() => {{
            const searchContainer = document.getElementById('search-container');
            if (searchContainer) searchContainer.style.display = 'none';
            
            const infoPanel = document.getElementById('info-panel');
            if (infoPanel) infoPanel.style.display = 'none';
            
            // Cacher les contrôles de carte
            const controls = document.querySelectorAll('.maplibregl-ctrl');
            controls.forEach(ctrl => ctrl.style.display = 'none');
            
            // S'assurer que la carte prend tout l'écran pour la capture si besoin
            const mapEl = document.getElementById('map');
            if (mapEl) {{
                mapEl.style.position = 'fixed';
                mapEl.style.top = '0';
                mapEl.style.left = '0';
                mapEl.style.width = '100vw';
                mapEl.style.height = '100vh';
                mapEl.style.zIndex = '9999';
            }}
        }});

        // Attendre un peu après le changement de style
        await new Promise(r => setTimeout(r, 1000));
        
        // Capturer la carte uniquement (ou tout le viewport maintenant que c'est plein écran)
        const screenshot = await page.screenshot({{
            type: 'png',
            encoding: 'base64',
            fullPage: true
        }});
        
        await browser.close();
        
        // Retourner l'image en base64
        console.log(JSON.stringify({{
            image: screenshot,
            success: true
        }}));
    }} catch (err) {{
        if (browser) await browser.close();
        console.error(err);
        process.exit(1);
    }}
}})();
"""
        
        return script
