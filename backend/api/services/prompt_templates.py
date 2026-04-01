"""
Prompt Templates pour la génération dynamique d'images DP2-DP6.
Chaque prompt est un texte descriptif riche qui intègre :
  - Les données saisies par l'utilisateur (dimensions, matériaux, couleurs…)
  - Les contraintes PLU issues de l'analyse (hauteur max, emprise, retraits…)
  - Le style graphique professionnel (plan technique architectural)

Les prompts sont générés en anglais pour maximiser la qualité de génération
par les modèles IA (Gemini), puis le cartouche / titre est en français.
"""

# ──────────────────────────────────────────────────────────────────────
# HELPERS : normalisation et détection du type de projet
# ──────────────────────────────────────────────────────────────────────

PROJECT_TYPE_MAPPING = {
    "abri_jardin": "abri_jardin",
    "abri de jardin": "abri_jardin",
    "piscine": "piscine",
    "garage": "garage",
    "veranda": "veranda",
    "véranda": "veranda",
    "terrasse": "terrasse",
    "extension": "extension",
    "hangar": "hangar",
    "surelevation": "surelevation",
    "surélévation": "surelevation",
    "cloture": "cloture",
    "clôture": "cloture",
    "transformation_garage": "transformation_garage",
}

PROJECT_LABELS_FR = {
    "abri_jardin": "Abri de jardin",
    "piscine": "Piscine",
    "garage": "Garage",
    "veranda": "Véranda",
    "terrasse": "Terrasse",
    "extension": "Extension",
    "hangar": "Hangar",
    "surelevation": "Surélévation",
    "cloture": "Clôture",
    "transformation_garage": "Transformation de garage",
    "default": "Construction",
}


def normalize_data(data):
    """Normalise les clés des données utilisateur (typos courantes + mapping frontend)."""
    if not isinstance(data, dict):
        return data
    normalized = data.copy()
    synonyms = {
        # Typos courantes
        "longueure": "longueur",
        "longueurs": "longueur",
        "long": "longueur",
        "larger": "largeur",
        "larg": "largeur",
        "largeure": "largeur",
        "surfaces": "surfaceCreee",
        "surface": "surfaceCreee",
        "hauteure": "hauteurConstruction",
        "haut": "hauteurConstruction",
        "epaisseur": "epaisseurMur",
        # Mapping champs frontend spécifiques → noms canoniques
        "longueurPiscine": "longueur",
        "largeurPiscine": "largeur",
        "surfaceBassin": "surfacePiscine",
        "hauteurMax": "hauteurCloture",
        "lineaireTotal": "lineaireCloture",
        "nombreNiveauxDessus": "nombreNiveaux",
        "nbPorte": "nbPortes",
        "nbFenetre": "nbFenetres",
        # Piscine distances
        "distancePiscine": "distanceMaison",
        "distancePiscineMaison": "distanceMaison",
        "distancePiscineLimite": "distanceLimite",
        # Couleurs spécifiques
        "couleurBassin": "couleurLiner",
        "couleurRevetement": "couleurLiner",
        "materiauCopings": "materiauMargelle",
    }
    for syn, canonical in synonyms.items():
        if syn in data and (canonical not in data or data[canonical] in [None, ""]):
            normalized[canonical] = data[syn]
    return normalized


def get_project_type(data):
    """Extrait le type de projet depuis natureTravaux ou descriptionProjet."""
    nature_travaux = data.get("natureTravaux", [])
    nature = ""
    if isinstance(nature_travaux, list) and nature_travaux:
        nature = nature_travaux[0].lower().strip()
    elif isinstance(nature_travaux, str):
        nature = nature_travaux.lower().strip()

    if not nature or nature == "default" or nature not in PROJECT_TYPE_MAPPING:
        description = str(data.get("descriptionProjet", "")).lower()
        for key, value in PROJECT_TYPE_MAPPING.items():
            if key.replace("_", " ") in description or key in description:
                return value

    return PROJECT_TYPE_MAPPING.get(nature, "default")


# ──────────────────────────────────────────────────────────────────────
# EXTRACTION DES VALEURS UTILES
# ──────────────────────────────────────────────────────────────────────

def _v(data, *keys, default="non précisé"):
    """Retourne la première valeur non vide trouvée parmi les clés."""
    for k in keys:
        val = data.get(k)
        if val not in (None, "", "?", 0, "0"):
            return str(val)
    return default


def _extract_project_info(data):
    """Extrait un dict lisible des infos projet depuis les données formulaire."""
    project_type = get_project_type(data)
    label = PROJECT_LABELS_FR.get(project_type, PROJECT_LABELS_FR["default"])

    info = {
        "type": project_type,
        "label": label,
        # Dimensions — cherche d'abord les clés normalisées, puis les clés frontend brutes
        "largeur": _v(data, "largeur", "largeurPiscine", "larg"),
        "longueur": _v(data, "longueur", "longueurPiscine", "long"),
        "hauteur": _v(data, "hauteurConstruction", "hauteurCloture", "hauteurMax", "hauteur"),
        # Surfaces
        "surface_creee": _v(data, "surfaceCreee", "surfacePiscine", "surfaceBassin",
                             "surfacePlancherCreee", "empriseSolCreee"),
        "emprise_sol": _v(data, "empriseSolCreee", "empriseCreee"),
        # Matériaux & couleurs
        "materiau_facade": _v(data, "materiauFacade"),
        "couleur_facade": _v(data, "couleurFacade"),
        "materiau_toiture": _v(data, "materiauToiture"),
        "couleur_toiture": _v(data, "couleurToiture"),
        # Niveaux
        "nombre_niveaux": _v(data, "nombreNiveaux", "nombreNiveauxDessus", default="1"),
        "nombre_vehicules": _v(data, "nombreVehicules"),
        # Piscine
        "profondeur": _v(data, "profondeurMoyenne", "profondeurPiscine"),
        "couleur_liner": _v(data, "couleurLiner", default="Bleu clair"),
        "materiau_margelle": _v(data, "materiauMargelle", default="Pierre naturelle"),
        "distance_maison": _v(data, "distanceMaison"),
        "distance_limite": _v(data, "distanceLimite"),
        "dispositif_securite": _v(data, "dispositifSecurite", default="Barrière"),
        "piscine_couverte": _v(data, "piscineCouverte", default="Non"),
        # Terrasse
        "materiau_terrasse": _v(data, "materiauTerrasse"),
        # Clôture — cherche les clés normalisées ET les clés frontend brutes
        "type_cloture": _v(data, "materiauCloture"),
        "couleur_cloture": _v(data, "couleurCloture"),
        "lineaire_cloture": _v(data, "lineaireCloture", "lineaireTotal"),
        # Véranda
        "type_vitrage": _v(data, "typeVitrage"),
        "pente_toiture": _v(data, "penteToiture"),
        # Portes / fenêtres
        "nb_portes": _v(data, "nbPortes", "nbPorte", default="1"),
        "nb_fenetres": _v(data, "nbFenetres", "nbFenetre", default="2"),
        # Localisation
        "adresse": _v(data, "terrainAdresse", "address"),
        "ville": _v(data, "terrainVille", "city"),
        "section": _v(data, "section", "sectionCadastrale"),
        "parcelle": _v(data, "numeroParcelle"),
        "surface_terrain": _v(data, "surfaceTerrain"),
        # Description
        "description": _v(data, "descriptionProjet", "descriptionLibreProjet"),
    }
    return info


def _extract_plu_info(data):
    """Extrait les contraintes PLU depuis data.pluAnalysis."""
    plu = data.get("pluAnalysis") or {}
    return {
        "zone": _v(plu, "zone", "zone_urba", default="Zone non identifiée"),
        "zone_description": _v(plu, "zone_description", default=""),
        "hauteur_max": _v(plu, "hauteur_max", default="à vérifier"),
        "emprise_sol": _v(plu, "emprise_sol", default="à vérifier"),
        "retraits": _v(plu, "retraits", default="à vérifier"),
        "stationnement": _v(plu, "stationnement", default="à vérifier"),
        "espaces_verts": _v(plu, "espaces_verts", default="à vérifier"),
        "demarche_admin": _v(plu, "demarche_admin", default="Déclaration préalable"),
    }


# ──────────────────────────────────────────────────────────────────────
# SPÉCIFICATIONS VISUELLES — couleurs, matériaux, mesures sur l'image
# ──────────────────────────────────────────────────────────────────────

def _is_specified(val):
    """Retourne True si la valeur est renseignée (ni 'non précisé', ni vide, ni None)."""
    return val not in (None, "", "non précisé", "non précisée", "à vérifier", "Non")


def _safe(val, fallback=""):
    """Retourne val si spécifié, sinon fallback. Pour interpolation sûre dans les prompts."""
    return val if _is_specified(val) else fallback


def _build_visual_specs(proj, plu, view_type="plan"):
    """
    Génère un bloc d'instructions visuelles FORTES pour que les couleurs,
    matériaux et mesures du formulaire soient réellement appliqués sur l'image.
    Toutes les valeurs 'non précisé' sont ignorées pour éviter que l'IA refuse.
    view_type: 'plan' (top-down), 'coupe' (cross-section), 'facade', '3d', 'paysage'
    """
    specs = []
    has_color_specs = False

    # ── COULEURS & MATÉRIAUX ────────────────────────────────────────
    color_lines = []
    ptype = proj["type"]

    if ptype == "piscine":
        if _is_specified(proj.get("couleur_liner")):
            color_lines.append(f"  • Pool water/liner color: {proj['couleur_liner']} — the pool basin MUST be rendered in this exact color")
        if _is_specified(proj.get("materiau_margelle")):
            color_lines.append(f"  • Pool coping/margelle material: {proj['materiau_margelle']} — render realistic texture")
        if _is_specified(proj.get("dispositif_securite")):
            color_lines.append(f"  • Safety device: {proj['dispositif_securite']}")
        if proj.get("piscine_couverte") not in ("Non", "non précisé", None, ""):
            color_lines.append("  • Pool is COVERED — show a transparent/translucent cover structure")
    elif ptype == "cloture":
        if _is_specified(proj.get("type_cloture")):
            color_lines.append(f"  • Fence material: {proj['type_cloture']} — render with realistic {proj['type_cloture']} texture")
        if _is_specified(proj.get("couleur_cloture")):
            color_lines.append(f"  • Fence color: {proj['couleur_cloture']} — the fence MUST be rendered in this exact color")
    else:
        if _is_specified(proj.get("couleur_facade")):
            color_lines.append(f"  • WALL/FACADE COLOR: {proj['couleur_facade']} — ALL walls MUST be rendered in {proj['couleur_facade']} color")
        if _is_specified(proj.get("materiau_facade")):
            color_lines.append(f"  • WALL MATERIAL: {proj['materiau_facade']} — render with realistic {proj['materiau_facade']} texture")
        if _is_specified(proj.get("couleur_toiture")):
            color_lines.append(f"  • ROOF COLOR: {proj['couleur_toiture']} — the roof surface MUST be {proj['couleur_toiture']} colored")
        if _is_specified(proj.get("materiau_toiture")):
            color_lines.append(f"  • ROOF MATERIAL: {proj['materiau_toiture']} — render realistic {proj['materiau_toiture']} texture on the roof")

    if color_lines:
        has_color_specs = True
        specs.append("VISUAL SPECIFICATIONS (apply these on the generated image):")
        specs.append("")
        specs.append("COLOR & MATERIAL REQUIREMENTS — Apply these EXACT colors and materials:")
        specs.extend(color_lines)

    # ── MESURES & DIMENSIONS ────────────────────────────────────────
    dim_lines = []

    if ptype == "piscine":
        if _is_specified(proj.get("longueur")):
            dim_lines.append(f"  • Pool length: {proj['longueur']}m (horizontal dimension line)")
        if _is_specified(proj.get("largeur")):
            dim_lines.append(f"  • Pool width: {proj['largeur']}m (vertical dimension line)")
        if _is_specified(proj.get("profondeur")):
            dim_lines.append(f"  • Pool depth: {proj['profondeur']}m" + (" (show on cross-section)" if view_type == "coupe" else " (annotate near pool)"))
        if _is_specified(proj.get("surface_creee")):
            dim_lines.append(f"  • Pool surface: {proj['surface_creee']}m² (label inside pool area)")
        if _is_specified(proj.get("distance_maison")):
            dim_lines.append(f"  • DISTANCE pool ↔ house: {proj['distance_maison']}m — show a dimensioned arrow/line between pool and existing house")
        if _is_specified(proj.get("distance_limite")):
            dim_lines.append(f"  • DISTANCE pool ↔ property boundary: {proj['distance_limite']}m — show dimensioned arrow to nearest boundary")
    elif ptype == "cloture":
        if _is_specified(proj.get("lineaire_cloture")):
            dim_lines.append(f"  • Fence total length: {proj['lineaire_cloture']}m (dimension along fence)")
        if _is_specified(proj.get("hauteur")):
            dim_lines.append(f"  • Fence height: {proj['hauteur']}m" + (" (show on elevation)" if view_type in ("facade", "coupe") else " (annotate)"))
    else:
        if _is_specified(proj.get("longueur")):
            dim_lines.append(f"  • Building length: {proj['longueur']}m (dimension line)")
        if _is_specified(proj.get("largeur")):
            dim_lines.append(f"  • Building width: {proj['largeur']}m (dimension line)")
        if _is_specified(proj.get("hauteur")):
            dim_lines.append(f"  • Building height: {proj['hauteur']}m" + (" (vertical dimension on section/facade)" if view_type in ("coupe", "facade") else " (annotate)"))
        if _is_specified(proj.get("surface_creee")):
            dim_lines.append(f"  • Surface: {proj['surface_creee']}m² (area label)")
        if _is_specified(proj.get("nombre_niveaux")) and proj["nombre_niveaux"] != "1":
            dim_lines.append(f"  • Number of levels: {proj['nombre_niveaux']} — show {proj['nombre_niveaux']} floor(s) visible")

    if dim_lines:
        specs.append("")
        specs.append("DIMENSIONS & MEASUREMENTS — These MUST appear as annotated dimension lines on the image:")
        specs.extend(dim_lines)

    # PLU constraints as visual annotations
    plu_lines = []
    if _is_specified(plu.get("hauteur_max")):
        plu_lines.append(f"  • Max height PLU: {plu['hauteur_max']} (dashed red line)")
    if _is_specified(plu.get("retraits")):
        plu_lines.append(f"  • Setbacks: {plu['retraits']} (dimensioned arrows from boundaries)")
    if _is_specified(plu.get("emprise_sol")):
        plu_lines.append(f"  • Max ground coverage: {plu['emprise_sol']}")

    if plu_lines:
        specs.append("")
        specs.append("PLU REGULATORY DIMENSIONS (show as dashed reference lines/annotations):")
        specs.extend(plu_lines)

    if has_color_specs:
        specs.append("")
        specs.append("IMPORTANT: The colors and materials above are from the building permit application and should be faithfully represented.")

    return "\n".join(specs)


# ──────────────────────────────────────────────────────────────────────
# INSTRUCTIONS DE STYLE — référence l'image modèle envoyée en multimodal
# ──────────────────────────────────────────────────────────────────────

STYLE_BASE = """
STYLE REFERENCE:
Look at the attached reference image carefully. You MUST reproduce the EXACT SAME visual style:
- Same type of top-down architectural plan rendering
- Same green lawn/garden texture filling the plot
- Same thick hedge/vegetation border around the property perimeter
- Same grey roof rendering for the existing house (with visible ridge line and slopes)
- Same style of dimension lines (thin black lines with measurements in meters like "15.00 m", "8.50 m")
- Same compass rose (N arrow) in the bottom-left corner
- Same top title banner with dark background and white text
- Same bottom cartouche bar with "Échelle", "Projet", info cells
- Same paved driveway/access path texture (grey stone/concrete pavers)
- Same labeling style: white text on elements, dimension arrows, area annotations like "(30.00 m²)"
- Same "NFP = TN + 0.10m" annotation style
- Same "Accès" marker with arrow at property entrance
- Same overall proportions, spacing, and professional quality

CRITICAL: The output image must look like it was made by the SAME architect/software as the reference image.
Do NOT change the visual style. Only change the CONTENT (layout, dimensions, project type) as specified below.
"""


# ──────────────────────────────────────────────────────────────────────
# HELPERS — descriptions de projet sûres (sans "non précisé")
# ──────────────────────────────────────────────────────────────────────

def _color_material_lines(proj, prefix=""):
    """Génère les lignes couleur/matériau uniquement si renseignées."""
    lines = []
    p = prefix
    if _is_specified(proj.get("couleur_facade")):
        lines.append(f"{p}- Walls rendered in {proj['couleur_facade']} color")
    if _is_specified(proj.get("materiau_facade")):
        lines.append(f"{p}- Wall material: {proj['materiau_facade']}")
    if _is_specified(proj.get("couleur_toiture")):
        lines.append(f"{p}- Roof rendered in {proj['couleur_toiture']} color")
    if _is_specified(proj.get("materiau_toiture")):
        lines.append(f"{p}- Roof material: {proj['materiau_toiture']}")
    return "\n".join(lines)


def _dim_str(proj):
    """Renvoie 'LxWm, height Hm' en n'incluant que les valeurs renseignées."""
    parts = []
    if _is_specified(proj.get("longueur")) and _is_specified(proj.get("largeur")):
        parts.append(f"{proj['longueur']}m x {proj['largeur']}m")
    elif _is_specified(proj.get("longueur")):
        parts.append(f"longueur {proj['longueur']}m")
    if _is_specified(proj.get("hauteur")):
        parts.append(f"height {proj['hauteur']}m")
    return ", ".join(parts) if parts else "dimensions as per project"


def _build_section_desc_dp3(proj):
    """Construit la description coupe DP3 sans valeurs 'non précisé'."""
    ptype = proj["type"]

    if ptype == "piscine":
        lines = ["CROSS-SECTION CONTENT:"]
        lines.append("- Show the pool basin cut in half: excavation below ground level, concrete shell walls, waterproofing layer")
        if _is_specified(proj.get("couleur_liner")):
            lines.append(f"- Interior pool liner rendered in {proj['couleur_liner']} color")
        else:
            lines.append("- Light blue liner inside pool basin")
        dim_parts = []
        if _is_specified(proj.get("longueur")):
            dim_parts.append(f"{proj['longueur']}m wide")
        if _is_specified(proj.get("profondeur")):
            dim_parts.append(f"depth {proj['profondeur']}m from coping — SHOW DEPTH DIMENSION LINE vertically")
        if dim_parts:
            lines.append(f"- Pool dimensions: {', '.join(dim_parts)}")
        if _is_specified(proj.get("materiau_margelle")):
            lines.append(f"- Pool coping/margelle: {proj['materiau_margelle']} texture at the edges")
        lines.append('- Natural terrain line ("TN") shown as dashed line')
        lines.append('- Finished level ("NFP") slightly above TN')
        lines.append("- Underground: compacted gravel base, concrete slab, filtration pipes")
        if _is_specified(proj.get("dispositif_securite")):
            lines.append(f"- Safety: {proj['dispositif_securite']} on both sides")
        lines.append('- "Local technique" room shown to one side')
        lines.append("- Water level line inside pool clearly visible")
        if _is_specified(proj.get("distance_maison")):
            lines.append(f"- DISTANCE to house: {proj['distance_maison']}m — horizontal dimension arrow")
        if _is_specified(proj.get("distance_limite")):
            lines.append(f"- DISTANCE to property boundary: {proj['distance_limite']}m — horizontal dimension arrow")
        return "\n".join(lines)

    elif ptype == "cloture":
        lines = ["CROSS-SECTION CONTENT:"]
        lines.append("- Fence/wall cut showing:")
        lines.append("  * Foundation below ground (~30cm)")
        fence_desc = "  * Wall/fence structure"
        if _is_specified(proj.get("type_cloture")):
            fence_desc += f": {proj['type_cloture']}"
        if _is_specified(proj.get("couleur_cloture")):
            fence_desc += f" in {proj['couleur_cloture']} color"
        lines.append(fence_desc)
        if _is_specified(proj.get("hauteur")):
            lines.append(f"  * Height: {proj['hauteur']}m — VERTICAL DIMENSION LINE")
        lines.append("  * Post/pillar detail visible")
        lines.append("  * Ground line and terrain profile")
        return "\n".join(lines)

    elif ptype == "terrasse":
        lines = ["CROSS-SECTION CONTENT:"]
        lines.append("- Terrace cross-section showing:")
        lines.append("  * Ground preparation layer (compacted gravel)")
        lines.append("  * Support structure (concrete slab or plots/pilotis)")
        if _is_specified(proj.get("materiau_terrasse")):
            lines.append(f"  * Decking surface: {proj['materiau_terrasse']}")
        lines.append("  * Height from natural ground level dimensioned")
        lines.append("  * Connection to existing house wall visible")
        return "\n".join(lines)

    elif ptype == "surelevation":
        lines = ["CROSS-SECTION CONTENT:"]
        lines.append("- Existing building in lighter grey (lower portion)")
        lines.append("- New raised level on top with different hatching pattern")
        new_walls = "- New walls"
        if _is_specified(proj.get("materiau_facade")):
            new_walls += f": {proj['materiau_facade']}"
        if _is_specified(proj.get("couleur_facade")):
            new_walls += f" in {proj['couleur_facade']} color"
        lines.append(new_walls)
        new_roof = "- New roof"
        if _is_specified(proj.get("materiau_toiture")):
            new_roof += f": {proj['materiau_toiture']}"
        if _is_specified(proj.get("couleur_toiture")):
            new_roof += f" in {proj['couleur_toiture']} color"
        lines.append(new_roof)
        if _is_specified(proj.get("hauteur")):
            lines.append(f"- Added height: {proj['hauteur']}m — VERTICAL DIMENSION LINE")
        lines.append("- Junction/reinforcement between old and new visible")
        return "\n".join(lines)

    else:
        # Generic building types
        lines = ["CROSS-SECTION CONTENT:"]
        lines.append("- Building cut in half showing internal structure:")
        lines.append("  * Foundations (béton armé) below ground level, ~60cm deep")
        lines.append("  * Floor slab (dalle béton) on compacted gravel")
        wall_desc = "  * Walls"
        if _is_specified(proj.get("materiau_facade")):
            wall_desc += f": {proj['materiau_facade']}"
        if _is_specified(proj.get("couleur_facade")):
            wall_desc += f" in {proj['couleur_facade']} color"
        wall_desc += " with 45° hatching for cut sections"
        lines.append(wall_desc)
        roof_desc = "  * Roof structure"
        if _is_specified(proj.get("materiau_toiture")):
            roof_desc += f": {proj['materiau_toiture']}"
        if _is_specified(proj.get("couleur_toiture")):
            roof_desc += f" in {proj['couleur_toiture']} color"
        roof_desc += ", visible rafters/charpente"
        lines.append(roof_desc)
        if _is_specified(proj.get("hauteur")):
            lines.append(f"  * Ridge height: {proj['hauteur']}m — VERTICAL DIMENSION LINE")
        lines.append("  * Interior ceiling height visible")
        lines.append("  * Door/window openings in the cut wall")
        lines.append('- Natural terrain line ("TN") as dashed line')
        lines.append('- Finished level ("NFP") above TN')
        return "\n".join(lines)


def _build_facade_desc_dp4(proj):
    """Construit la description façade DP4 sans valeurs 'non précisé'."""
    ptype = proj["type"]

    if ptype == "piscine":
        lines = ["FAÇADE CONTENT:"]
        lines.append("- Show 2 views:")
        lines.append('  1. "Local technique" front elevation: small equipment room, door, ventilation')
        if _is_specified(proj.get("dispositif_securite")):
            lines.append(f"  2. Pool safety device elevation: {proj['dispositif_securite']} viewed from the side")
        if _is_specified(proj.get("materiau_margelle")):
            lines.append(f"- Pool coping edge profile: {proj['materiau_margelle']}")
        if _is_specified(proj.get("profondeur")):
            lines.append(f"- Pool depth annotated: {proj['profondeur']}m")
        return "\n".join(lines)

    elif ptype == "cloture":
        lines = ["FAÇADE CONTENT:"]
        lines.append("- Show the fence/wall full-length elevation:")
        if _is_specified(proj.get("lineaire_cloture")):
            lines.append(f"  * Total length: {proj['lineaire_cloture']}m — HORIZONTAL DIMENSION LINE")
        if _is_specified(proj.get("hauteur")):
            lines.append(f"  * Height: {proj['hauteur']}m — VERTICAL DIMENSION LINE")
        if _is_specified(proj.get("type_cloture")):
            lines.append(f"  * Material: {proj['type_cloture']}")
        if _is_specified(proj.get("couleur_cloture")):
            lines.append(f"  * Color: {proj['couleur_cloture']} — render fence in this color")
        lines.append("  * Regular post spacing")
        lines.append("  * Gate/portal detail with dimensions")
        lines.append('  * Ground line ("TN") below')
        return "\n".join(lines)

    else:
        lines = ["FAÇADE CONTENT:"]
        lines.append("- Show 4 elevation views arranged on the page (2 rows × 2 columns):")
        lines.append('  1. "FAÇADE PRINCIPALE" (top-left): Front view from street')
        lines.append('  2. "FAÇADE ARRIÈRE" (top-right): Rear view from garden')
        lines.append('  3. "FAÇADE LATÉRALE GAUCHE" (bottom-left): Left side')
        lines.append('  4. "FAÇADE LATÉRALE DROITE" (bottom-right): Right side')
        lines.append("")
        lines.append("For each elevation:")
        wall_line = "- Walls"
        if _is_specified(proj.get("materiau_facade")):
            wall_line += f": {proj['materiau_facade']}"
        if _is_specified(proj.get("couleur_facade")):
            wall_line += f" rendered in {proj['couleur_facade']} color"
        lines.append(wall_line)
        roof_line = "- Roof"
        if _is_specified(proj.get("materiau_toiture")):
            roof_line += f": {proj['materiau_toiture']}"
        if _is_specified(proj.get("couleur_toiture")):
            roof_line += f" rendered in {proj['couleur_toiture']} color"
        roof_line += ", slope visible"
        lines.append(roof_line)
        openings = []
        if _is_specified(proj.get("nb_portes")):
            openings.append(f"{proj['nb_portes']} door(s)")
        if _is_specified(proj.get("nb_fenetres")):
            openings.append(f"{proj['nb_fenetres']} window(s)")
        if openings:
            lines.append(f"- {' and '.join(openings)}")
        lines.append("- Ridge line, eaves, gutters")
        lines.append('- Ground line ("TN") at bottom')
        if _is_specified(proj.get("hauteur")):
            lines.append(f"- Height: {proj['hauteur']}m — VERTICAL DIMENSION LINES on both sides")
        lines.append("- Width dimension lines at bottom")
        return "\n".join(lines)


def _build_view_desc_dp5(proj):
    """Construit la description vue 3D DP5 sans valeurs 'non précisé'."""
    ptype = proj["type"]

    if ptype == "piscine":
        lines = ["SCENE CONTENT:"]
        dim_parts = []
        if _is_specified(proj.get("longueur")) and _is_specified(proj.get("largeur")):
            dim_parts.append(f"{proj['longueur']}m x {proj['largeur']}m")
        lines.append(f"- Swimming pool{' (' + dim_parts[0] + ')' if dim_parts else ''} visible from above-side angle")
        if _is_specified(proj.get("couleur_liner")):
            lines.append(f"- Pool water colored in {proj['couleur_liner']} (liner color)")
        else:
            lines.append("- Pool water shown as light blue")
        if _is_specified(proj.get("materiau_margelle")):
            lines.append(f"- Pool coping/margelle: {proj['materiau_margelle']} texture")
        lines.append("- Surrounding terrace with paved surface")
        if _is_specified(proj.get("dispositif_securite")):
            lines.append(f"- Safety: {proj['dispositif_securite']} shown realistically")
        lines.append('- "Local technique" room nearby')
        lines.append("- Lush garden around with hedges and trees")
        if _is_specified(proj.get("distance_maison")):
            lines.append(f"- Distance to house ({proj['distance_maison']}m) visually proportionate")
        return "\n".join(lines)

    elif ptype == "cloture":
        lines = ["SCENE CONTENT:"]
        fence_parts = []
        if _is_specified(proj.get("lineaire_cloture")):
            fence_parts.append(f"{proj['lineaire_cloture']}m")
        if _is_specified(proj.get("hauteur")):
            fence_parts.append(f"height {proj['hauteur']}m")
        lines.append(f"- Fence/wall{' (' + ', '.join(fence_parts) + ')' if fence_parts else ''} seen from street perspective")
        if _is_specified(proj.get("type_cloture")):
            lines.append(f"- Material: {proj['type_cloture']}")
        if _is_specified(proj.get("couleur_cloture")):
            lines.append(f"- Color: {proj['couleur_cloture']} — render fence in this color")
        lines.append("- Gate/entrance visible")
        lines.append("- Existing house behind the fence")
        lines.append("- Street and sidewalk in foreground")
        return "\n".join(lines)

    else:
        lines = ["SCENE CONTENT:"]
        lines.append(f"- {proj['label']} ({_dim_str(proj)}) in 3/4 perspective")
        cm = _color_material_lines(proj)
        if cm:
            lines.append(cm)
        detail_parts = []
        if _is_specified(proj.get("nombre_niveaux")):
            detail_parts.append(f"{proj['nombre_niveaux']} level(s)")
        if _is_specified(proj.get("nb_portes")):
            detail_parts.append(f"{proj['nb_portes']} door(s)")
        if _is_specified(proj.get("nb_fenetres")):
            detail_parts.append(f"{proj['nb_fenetres']} window(s)")
        if detail_parts:
            lines.append(f"- {', '.join(detail_parts)}")
        lines.append("- Adjacent/attached to existing house")
        lines.append("- Garden and vegetation around")
        if _is_specified(proj.get("hauteur")):
            lines.append(f"- Height ({proj['hauteur']}m) visually proportionate to existing house")
        return "\n".join(lines)


def _build_integration_desc_dp6(proj):
    """Construit la description insertion paysagère DP6 sans valeurs 'non précisé'."""
    ptype = proj["type"]

    if ptype == "piscine":
        lines = ["INTEGRATION:"]
        dim_parts = []
        if _is_specified(proj.get("longueur")) and _is_specified(proj.get("largeur")):
            dim_parts.append(f"{proj['longueur']}m x {proj['largeur']}m")
        lines.append(f"- Pool{' (' + dim_parts[0] + ')' if dim_parts else ''} integrated into garden landscape")
        if _is_specified(proj.get("couleur_liner")):
            lines.append(f"- Pool water color: {proj['couleur_liner']} — visible even from distance")
        else:
            lines.append("- Pool water shown as light blue")
        if _is_specified(proj.get("materiau_margelle")):
            lines.append(f"- Pool coping: {proj['materiau_margelle']}")
        lines.append("- Mediterranean/local vegetation around")
        lines.append("- Terrace with paved surface")
        if _is_specified(proj.get("dispositif_securite")):
            lines.append(f"- Safety: {proj['dispositif_securite']} blending with landscaping")
        return "\n".join(lines)

    elif ptype == "cloture":
        lines = ["INTEGRATION:"]
        fence_parts = []
        if _is_specified(proj.get("lineaire_cloture")):
            fence_parts.append(f"{proj['lineaire_cloture']}m")
        if _is_specified(proj.get("hauteur")):
            fence_parts.append(f"{proj['hauteur']}m")
        lines.append(f"- Fence{' (' + ', '.join(fence_parts) + ')' if fence_parts else ''} integrated with climbing plants and hedge")
        if _is_specified(proj.get("couleur_cloture")):
            lines.append(f"- Fence color: {proj['couleur_cloture']} — visible in the landscape")
        if _is_specified(proj.get("type_cloture")):
            lines.append(f"- Fence material: {proj['type_cloture']}")
        lines.append("- Mature trees in background")
        lines.append("- Fits the neighborhood character")
        return "\n".join(lines)

    else:
        lines = ["INTEGRATION:"]
        lines.append(f"- {proj['label']} ({_dim_str(proj)}) harmoniously placed")
        cm = _color_material_lines(proj)
        if cm:
            lines.append(cm)
        lines.append("- Matching neighboring buildings in style and scale")
        lines.append("- Reinforced landscaping with native species")
        return "\n".join(lines)


def _build_project_desc_dp2(proj):
    """Construit la description projet DP2 sans valeurs 'non précisé'."""
    ptype = proj["type"]

    if ptype == "piscine":
        lines = [f"PROJECT TO DRAW (replacing the pool in the reference):"]
        lines.append(f"- In-ground swimming pool: {_dim_str(proj)}")
        if _is_specified(proj.get("profondeur")):
            lines.append(f"- Depth: {proj['profondeur']}m")
        if _is_specified(proj.get("couleur_liner")):
            lines.append(f"- Pool basin filled with {proj['couleur_liner']} color (liner color)")
        else:
            lines.append("- Pool basin shown as light blue rectangle with water texture")
        if _is_specified(proj.get("materiau_margelle")):
            lines.append(f"- Pool border/coping: {proj['materiau_margelle']} texture")
        else:
            lines.append("- Pool border/coping: light grey concrete band")
        lines.append('- Adjacent terrace: paved area next to pool')
        lines.append('- "Local technique": small grey rectangle near pool')
        if _is_specified(proj.get("dispositif_securite")):
            lines.append(f"- Safety: {proj['dispositif_securite']}")
        if _is_specified(proj.get("surface_creee")):
            lines.append(f'- Label: "Piscine Projetée" — {proj["surface_creee"]}m²')
        if _is_specified(proj.get("distance_maison")):
            lines.append(f"- DISTANCE pool ↔ house: {proj['distance_maison']}m (dimensioned arrow)")
        if _is_specified(proj.get("distance_limite")):
            lines.append(f"- DISTANCE pool ↔ property boundary: {proj['distance_limite']}m (dimensioned arrow)")
        return "\n".join(lines)

    elif ptype == "cloture":
        lines = ["PROJECT TO DRAW (along property boundary):"]
        parts = []
        if _is_specified(proj.get("lineaire_cloture")):
            parts.append(f"{proj['lineaire_cloture']}m linear")
        if _is_specified(proj.get("hauteur")):
            parts.append(f"height {proj['hauteur']}m")
        if parts:
            lines.append(f"- Fence/wall: {', '.join(parts)}")
        if _is_specified(proj.get("type_cloture")):
            lines.append(f"- Type: {proj['type_cloture']}")
        if _is_specified(proj.get("couleur_cloture")):
            lines.append(f"- Color: {proj['couleur_cloture']} — render fence in this color")
        lines.append('- Thick line along property boundary with regular post marks')
        lines.append('- Gate/portal at the "Accès" entrance point')
        lines.append('- Label: "Clôture Projetée"')
        return "\n".join(lines)

    elif ptype == "terrasse":
        lines = ["PROJECT TO DRAW (adjacent to existing house):"]
        lines.append(f"- Terrace: {_dim_str(proj)}")
        if _is_specified(proj.get("materiau_terrasse")):
            lines.append(f"- Shown as paved rectangle with {proj['materiau_terrasse']} texture")
        else:
            lines.append("- Shown as paved rectangle")
        lines.append("- Adjacent to the existing house on the garden side")
        if _is_specified(proj.get("surface_creee")):
            lines.append(f'- Label: "Terrasse Projetée" — {proj["surface_creee"]}m²')
        return "\n".join(lines)

    else:
        # Generic for garage, abri_jardin, extension, veranda, hangar, surelevation, etc.
        type_labels = {
            "garage": ("Garage", "replacing the pool area in the reference"),
            "abri_jardin": ("Abri de Jardin", "replacing the pool area in the reference"),
            "extension": ("Extension", "attached to the existing house"),
            "veranda": ("Véranda", "attached to existing house"),
            "hangar": ("Hangar", "large structure on the plot"),
            "surelevation": ("Surélévation", "on top of existing house"),
        }
        label, ctx = type_labels.get(ptype, (proj["label"], "on the plot"))
        lines = [f"PROJECT TO DRAW ({ctx}):"]
        lines.append(f"- {label}: {_dim_str(proj)}")
        if _is_specified(proj.get("surface_creee")):
            lines.append(f"- Surface: {proj['surface_creee']}m²")
        cm = _color_material_lines(proj)
        if cm:
            lines.append(cm)
        if ptype == "garage" and _is_specified(proj.get("nombre_vehicules")):
            lines.append(f"- {proj['nombre_vehicules']} vehicle space(s)")
            lines.append("- Garage door opening on the driveway side")
        if ptype == "extension":
            lines.append("- Rectangle ATTACHED to existing house, junction visible")
        if ptype == "veranda" and _is_specified(proj.get("type_vitrage")):
            lines.append(f"- Glazing: {proj['type_vitrage']}")
            lines.append("- Semi-transparent rectangle attached to house")
        if ptype == "surelevation":
            lines.append("- Existing house footprint stays the same, dashed outline marks modification")
        lines.append(f'- Label: "{label} Projeté"')
        return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────
# PROMPTS PAR TYPE DE DP
# ──────────────────────────────────────────────────────────────────────

def _build_dp2_prompt(proj, plu):
    """DP2 — Plan de masse : vue du dessus du terrain avec implantation du projet."""

    visual_specs = _build_visual_specs(proj, plu, view_type="plan")

    # Description spécifique du projet selon son type
    project_desc = _build_project_desc_dp2(proj)

    return f"""Generate a PLAN DE MASSE (DP2) image — a top-down site plan for a French "Déclaration Préalable de Travaux".

{STYLE_BASE}

{visual_specs}

WHAT TO CHANGE from the reference image:

1. TOP TITLE BANNER: "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN DE MASSE (DP2) - {proj['label']}{(' - ' + proj['surface_creee'] + ' m²') if _is_specified(proj.get('surface_creee')) else ''}"

2. PLOT DIMENSIONS: {('Adapt the property to ' + proj['surface_terrain'] + 'm² total area. ') if _is_specified(proj.get('surface_terrain')) else ''}Keep the rectangular plot shape with dimension annotations on all sides.

3. EXISTING HOUSE: Keep the "Maison existante" with grey roof (same style as reference), adjust size proportionally.

4. {project_desc}

5. KEEP THESE ELEMENTS (same style as reference):
   - "Stationnement" area with surface annotation
   - "Espaces verts" area with surface annotation
   - "Accès" marker with arrow at bottom of the plot
   - Thick green hedge border around the entire property
   - Compass rose (N) in bottom-left
   - "NFP = TN + 0.10m" annotation
   - All dimension lines in meters (XX.XX m format)

6. BOTTOM CARTOUCHE: "Échelle : 1/100" | "Projet: {proj['label']}{(' - ' + proj['surface_creee'] + ' m²') if _is_specified(proj.get('surface_creee')) else ''}" | "{proj['ville']}"

7. PLU COMPLIANCE (show setback distances with dimension arrows if applicable):
{('   - Retraits: ' + plu['retraits']) if _is_specified(plu.get('retraits')) else ''}
{('   - Hauteur max: ' + plu['hauteur_max']) if _is_specified(plu.get('hauteur_max')) else ''}
{('   - Emprise sol max: ' + plu['emprise_sol']) if _is_specified(plu.get('emprise_sol')) else ''}

IMPORTANT: The result MUST look identical in style to the reference image — same textures, same colors, same line weights, same label style. Only the content/layout changes.
"""


def _build_dp3_prompt(proj, plu):
    """DP3 — Plan en coupe : coupe transversale du terrain et de la construction."""

    visual_specs = _build_visual_specs(proj, plu, view_type="coupe")

    section_desc = _build_section_desc_dp3(proj)

    plu_height_line = ""
    if _is_specified(plu.get("hauteur_max")):
        plu_height_line = f'   - PLU max height: dashed line at {plu["hauteur_max"]} labeled "Hauteur max PLU: {plu["hauteur_max"]}"'

    return f"""Generate a PLAN EN COUPE (DP3) image — a cross-section drawing for a French "Déclaration Préalable de Travaux".

{STYLE_BASE}
ADAPT THE STYLE for a cross-section view (side cutaway) instead of top-down. Keep the same:
- Top title banner style (dark background, white text)
- Bottom cartouche style
- Dimension line style (thin lines with measurements in meters)
- Label and annotation style
- Same green ground/terrain texture for the earth section
- Same overall professional quality and color palette

{visual_specs}

WHAT TO GENERATE:

1. TOP TITLE: "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN EN COUPE (DP3) - {proj['label']}"

2. VIEW: Side cutaway view showing terrain profile and the project cut vertically.

3. TERRAIN:
   - Ground level line across the full width with green lawn/earth texture above
   - Below ground: brown/beige earth layers
   - "TN" (Terrain Naturel) label on the ground line
   - "NFP" (Niveau Fini Plancher) label slightly above

4. {section_desc}

5. ANNOTATIONS:
   - All height dimensions in meters (total height, depth below ground, interior heights)
   - Width dimensions of the structure
   - "COUPE AA" label at top
{plu_height_line}
   - Material labels on cut sections

6. BOTTOM CARTOUCHE: "Échelle : 1/100" | "Coupe {proj['label']}" | "{proj['ville']}"
"""


def _build_dp4_prompt(proj, plu):
    """DP4 — Façades et toitures : élévations de toutes les faces du bâtiment."""

    visual_specs = _build_visual_specs(proj, plu, view_type="facade")

    facade_desc = _build_facade_desc_dp4(proj)

    plu_height_note = ""
    if _is_specified(plu.get("hauteur_max")):
        plu_height_note = f'   - Hauteur max PLU: {plu["hauteur_max"]} (dashed reference line)'

    return f"""Generate a FAÇADES ET TOITURES (DP4) image — elevation drawings for a French "Déclaration Préalable de Travaux".

{STYLE_BASE}
ADAPT THE STYLE for elevation/façade views instead of top-down. Keep the same:
- Top title banner style, bottom cartouche style
- Dimension line and label style
- Same professional quality and color palette
- Clean flat architectural rendering

{visual_specs}

WHAT TO GENERATE:

1. TOP TITLE: "DOSSIER DE DÉCLARATION PRÉALABLE - FAÇADES ET TOITURES (DP4) - {proj['label']}"

2. {facade_desc}

3. ANNOTATIONS:
   - Height dimensions on both sides (total, eave, doors/windows)
   - Width dimensions at bottom
   - Material labels on the drawing
   - "TN" ground level line
{plu_height_note}

4. BOTTOM CARTOUCHE: "Échelle : 1/100" | "Façades {proj['label']}" | "{proj['ville']}"
"""


def _build_dp5_prompt(proj, plu):
    """DP5 — Représentation extérieure : vue 3D du projet dans son environnement."""

    visual_specs = _build_visual_specs(proj, plu, view_type="3d")

    view_desc = _build_view_desc_dp5(proj)

    height_annotation = ""
    if _is_specified(proj.get("hauteur")):
        height_annotation = f'   - Key dimension: height {proj["hauteur"]}m annotated on the structure'

    return f"""Generate a REPRÉSENTATION EXTÉRIEURE (DP5) image — a 3D perspective view for a French "Déclaration Préalable de Travaux".

{STYLE_BASE}
ADAPT THE STYLE for a 3D perspective view. Keep the same:
- Top title banner and bottom cartouche
- Same green vegetation/garden tones
- Same overall professional quality
- But render in 3/4 perspective (not top-down), slightly elevated angle (~30°)
- Semi-realistic architectural rendering (clean materials, soft lighting)

{visual_specs}

WHAT TO GENERATE:

1. TOP TITLE: "DOSSIER DE DÉCLARATION PRÉALABLE - REPRÉSENTATION EXTÉRIEURE (DP5) - {proj['label']}"

2. VIEW: 3D perspective from the main public viewpoint (street), elevated angle.

3. {view_desc}

4. ENVIRONMENT:
   - Existing house visible with same grey roof style
   - Garden with green lawn (same texture as reference)
   - Thick hedge border around property (same as reference)
   - Neighboring context suggested
   - Warm natural lighting, soft shadows

5. ANNOTATIONS (minimal but essential):
   - Label arrow: "{proj['label']} (PROJET)"
   - "Vue depuis la voie publique" caption
{height_annotation}

6. BOTTOM CARTOUCHE: "Échelle : non applicable" | "Représentation extérieure - {proj['label']}" | "{proj['ville']}"
"""


def _build_dp6_prompt(proj, plu):
    """DP6 — Insertion paysagère : simulation du projet dans le paysage."""

    visual_specs = _build_visual_specs(proj, plu, view_type="paysage")

    integration_desc = _build_integration_desc_dp6(proj)

    green_spaces_note = ""
    if _is_specified(plu.get("espaces_verts")):
        green_spaces_note = f'   - Green spaces: {plu["espaces_verts"]}'

    return f"""Generate an INSERTION PAYSAGÈRE (DP6) image — a landscape integration view for a French "Déclaration Préalable de Travaux".

{STYLE_BASE}
ADAPT THE STYLE for a wide landscape view. Keep the same:
- Top title banner and bottom cartouche
- Same vegetation green tones
- Same professional quality
- But render as a WIDER view from further away, showing neighborhood context
- Semi-realistic, warm atmosphere with sky and clouds

{visual_specs}

WHAT TO GENERATE:

1. TOP TITLE: "DOSSIER DE DÉCLARATION PRÉALABLE - INSERTION PAYSAGÈRE (DP6) - {proj['label']}"

2. VIEW: Wide-angle view from the most distant public viewpoint showing the project in its broader environment.

3. {integration_desc}

4. LANDSCAPE:
   - Wider neighborhood: street, neighboring houses, mature trees, sky
   - Existing vegetation preserved
   - New plantings along boundaries
   - The project fits NATURALLY — it does NOT dominate the image
{green_spaces_note}

5. ANNOTATIONS (minimal):
   - Small label: "{proj['label']}" pointing to the project
   - "Insertion dans le paysage existant" caption

6. BOTTOM CARTOUCHE: "Échelle : non applicable" | "Insertion paysagère - {proj['label']}" | "{proj['ville']}"
"""


# ──────────────────────────────────────────────────────────────────────
# POINT D'ENTRÉE PRINCIPAL
# ──────────────────────────────────────────────────────────────────────

_BUILDERS = {
    "dp2": _build_dp2_prompt,
    "dp3": _build_dp3_prompt,
    "dp4": _build_dp4_prompt,
    "dp5": _build_dp5_prompt,
    "dp6": _build_dp6_prompt,
}


def build_prompt_from_template(dp_type, data):
    """
    Construit le prompt final pour la génération d'image DP.
    Intègre automatiquement les données formulaire + PLU.
    """
    if dp_type not in _BUILDERS:
        raise ValueError(f"Type de DP non supporté: {dp_type}")

    normalized = normalize_data(data)
    proj = _extract_project_info(normalized)
    plu = _extract_plu_info(normalized)

    return _BUILDERS[dp_type](proj, plu)
