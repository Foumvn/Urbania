"""
CerfaService — Injection AcroForms directe dans le PDF CERFA 16702-02.

Approche :
  1. Lire le PDF template interactif (cerfa_16702-02_template.pdf)
  2. Mapper les données du formulaire web Urbania → champs AcroForms du PDF
  3. Filtrage dynamique des champs selon le type de projet
  4. Pour les projets « Autre », utiliser Mistral AI pour déterminer les champs pertinents
  5. Fusionner les images DP générées par l'IA comme pages supplémentaires
  6. Retourner le PDF final prêt à télécharger
"""
import os
import io
import base64
import logging
import time
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
#  Imports PDF (PyPDF2 + ReportLab + Pillow)
# ---------------------------------------------------------------------------
try:
    from PyPDF2 import PdfReader, PdfWriter
    from PyPDF2.generic import NameObject, BooleanObject, TextStringObject
    PYPDF2_OK = True
except ImportError:
    PYPDF2_OK = False
    logger.warning("PyPDF2 non disponible — génération PDF impossible")

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas as rl_canvas
    REPORTLAB_OK = True
except ImportError:
    REPORTLAB_OK = False

try:
    from PIL import Image
    PILLOW_OK = True
except ImportError:
    PILLOW_OK = False


class CerfaService:
    """Service de génération PDF CERFA 16702-02 via injection AcroForms."""

    BASE_DIR = Path(settings.BASE_DIR)
    TEMPLATE_PDF = BASE_DIR / "api/templates/cerfa/cerfa_16702-02_template.pdf"
    OUTPUT_DIR = BASE_DIR / "media/cerfa_outputs"

    # ======================================================================
    #  SECTION 1 : PROFILS DE CHAMPS PAR TYPE DE PROJET
    # ======================================================================

    # Champs TOUJOURS remplis quel que soit le projet (identité, terrain, engagement…)
    COMMON_FIELDS = {
        # Déclarant particulier
        "D1N_nom", "D1P_prenom", "D1A_naissance", "D1C_commune", "D1D_dept", "D1E_pays",
        # Déclarant personne morale
        "D2D_denomination", "D2R_raison", "D2J_type", "D2S_siret",
        "D2N_nom", "D2P_prenom",
        # Coordonnées déclarant
        "D3N_numero", "D3V_voie", "D3W_lieudit", "D3L_localite",
        "D3C_code", "D3B_boite", "D3X_cedex", "D3T_telephone",
        "D3K_indicatif", "D3P_pays", "D3D_division",
        "D5GE1_email", "D5GE2_email", "D5A_acceptation",
        # Terrain
        "T2Q_numero", "T2V_voie", "T2W_lieudit", "T2L_localite", "T2C_code",
        "T2F_prefixe", "T2S_section", "T2N_numero", "T2T_superficie",
        "T2FP2_prefixe", "T2SP2_section", "T2NP2_numero", "T2TP2_superficie",
        "T2FP3_prefixe", "T2SP3_section", "T2NP3_numero", "T2TP3_superficie",
        # Situation juridique
        "T3A_CUoui", "T3H_CUnon", "T3B_CUnc",
        "T3P_PUPoui", "T3C_PUPnon", "T3F_PUPnc",
        "T3G_AFUoui", "T3R_AFUnon", "T3E_AFUnc",
        "T3I_lotoui", "T3L_lotnon", "T3S_lotnc",
        "T3J_ZACoui", "T3Q_ZACnon", "T3T_ZACnc",
        "T3N_dates",
        # Nature des travaux (cases)
        "C2ZA1_nouvelle", "C2ZB1_existante", "C2ZC3_cloture",
        "C2ZD1_description",
        # Engagement
        "E1L_lieu", "E1D_date",
        # Récépissé / déposant
        "R2N_deposant",
        # Emprise au sol
        "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
        # Législations connexes (Section 5) — Oui/Non pairs
        "X1T_eau", "X1T0_eau",
        "X1E_environnement", "X1E0_environnement",
        "X1D_derogation", "X1D0_derogation",
        "X1C_classe", "X1C0_classe",
        "X1A_ABF", "X1A0_ABF",
        "X1L_legislation", "X1L0_legislation",
        "X1U_raccordement", "X1U0_raccordement",
        "X1V_toiture", "X1V0_toiture",
        "X1P_precisions",
        # Périmètres de protection
        "X2R_remarquable", "X2H_historique", "X2C_classe",
    }

    # --- Profils par type de projet connu ---
    # Champs législations connexes ajoutés automatiquement à tous les projets
    LEGISLATIONS_FIELDS = {
        "X1T_eau", "X1T0_eau", "X1E_environnement", "X1E0_environnement",
        "X1D_derogation", "X1D0_derogation", "X1C_classe", "X1C0_classe",
        "X1A_ABF", "X1A0_ABF", "X1L_legislation", "X1L0_legislation",
        "X1U_raccordement", "X1U0_raccordement", "X1V_toiture", "X1V0_toiture",
        "X1P_precisions",
        "X2R_remarquable", "X2H_historique", "X2C_classe",
    }

    PROJECT_PROFILES = {
        "piscine": {
            "checkboxes": {"C5ZE1_piscine", "C2ZA1_nouvelle"},
            "text_fields": {
                "C2ZD1_description", "C5ZA1_logements",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
                "C5ZJ1_niveaux",
            },
            "surfaces": True,  # Tableau W2 requis
            "stationnement": False,
            "voirie": False,
        },
        "garage": {
            "checkboxes": {"C5ZE2_garage", "C2ZA1_nouvelle"},
            "text_fields": {
                "C2ZD1_description", "C5ZA1_logements",
                "C5ZJ1_niveaux", "C5ZJ2_dessous",
                "C6ZL3_bois", "C6ZL4_ciment", "C6ZL5_beton",
                "C6ZM1_classique",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": True,
            "voirie": False,
        },
        "extension": {
            "checkboxes": {"C5ZK1_extension", "C2ZB1_existante"},
            "text_fields": {
                "C2ZD1_description", "C5ZA1_logements", "C5ZA2_individuels",
                "C5ZJ1_niveaux", "C5ZJ2_dessous",
                "C6ZL3_bois", "C6ZL4_ciment", "C6ZL5_beton", "C6ZL2_metal",
                "C6ZM1_classique",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": True,
            "voirie": False,
        },
        "veranda": {
            "checkboxes": {"C5ZE3_veranda", "C2ZB1_existante"},
            "text_fields": {
                "C2ZD1_description", "C5ZA1_logements",
                "C5ZJ1_niveaux",
                "C6ZL1_modulaire", "C6ZL2_metal",
                "C6ZM1_classique",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": False,
            "voirie": False,
        },
        "abri_jardin": {
            "checkboxes": {"C5ZE4_abri", "C2ZA1_nouvelle"},
            "text_fields": {
                "C2ZD1_description",
                "C5ZJ1_niveaux",
                "C6ZL3_bois",
                "C6ZM1_classique",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": False,
            "voirie": False,
        },
        "cloture": {
            "checkboxes": {"C2ZC3_cloture"},
            "text_fields": {
                "C2ZD1_description",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": False,
            "stationnement": False,
            "voirie": False,
        },
        "terrasse": {
            "checkboxes": {"C5ZE5_annexes", "C2ZA1_nouvelle"},
            "text_fields": {
                "C2ZD1_description", "C2ZA7_autres",
                "C5ZJ1_niveaux",
                "C6ZL3_bois", "C6ZL5_beton",
                "C6ZM1_classique",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": False,
            "voirie": False,
        },
        "surelevation": {
            "checkboxes": {"C5ZK2_surelevation", "C2ZB1_existante"},
            "text_fields": {
                "C2ZD1_description", "C5ZA1_logements",
                "C5ZJ1_niveaux", "C5ZJ2_dessous",
                "C6ZL4_ciment", "C6ZL5_beton",
                "C6ZM1_classique", "C6ZM2_profond",
                "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
            },
            "surfaces": True,
            "stationnement": True,
            "voirie": False,
        },
    }

    # Tous les champs AcroForm du PDF (pour validation et filtrage IA)
    ALL_CHECKBOX_FIELDS = {
        "B1B_special", "B1F_culture", "B1G_transport", "B1K_social",
        "B1L_enseignement", "B1S_sante",
        "C2ZA1_nouvelle", "C2ZB1_existante", "C2ZC3_cloture",
        "C2ZF1_principale", "C2ZF2_secondaire", "C2ZI0_agrivoltaique",
        "C5ZD1_personnel", "C5ZD2_vente", "C5ZD3_location",
        "C5ZE1_piscine", "C5ZE2_garage", "C5ZE3_veranda", "C5ZE4_abri",
        "C5ZE5_annexes", "C5ZE6_piece", "C5ZK1_extension",
        "C5ZK2_surelevation", "C5ZK3_supplementaires",
        "C6ZL1_modulaire", "C6ZL2_metal", "C6ZL3_bois", "C6ZL4_ciment", "C6ZL5_beton",
        "C6ZM1_classique", "C6ZM2_profond", "C6ZM3_terre",
        "D5A_acceptation", "M2B_ABF", "M2J_PN",
        "P1FP1", "P3FA1", "P3GD1", "P3GE1", "P3GF1", "P3GG1", "P3GH1",
        "P4CD1", "P4CF1", "P4EA1", "P4EB1", "P4EC1", "P4EG1", "P4EH1",
        "P4FJ1", "P4FK1", "P4FK2", "P4GE1", "P4GF1", "P4HG1",
        "P4KB2", "P4KB3", "P4KB4", "P4LA1", "P4LC1", "P4LD1", "P4LE1", "P4LG1",
        "P5PA2", "P5PB1", "P5PC1", "P5PD1", "P5PE1", "P6PF1", "P8EA1", "P9ZA1",
        "T3A_CUoui", "T3B_CUnc", "T3C_PUPnon", "T3E_AFUnc", "T3F_PUPnc",
        "T3G_AFUoui", "T3H_CUnon", "T3I_lotoui", "T3J_ZACoui", "T3L_lotnon",
        "T3P_PUPoui", "T3Q_ZACnon", "T3R_AFUnon", "T3S_lotnc", "T3T_ZACnc",
        "X1A0_ABF", "X1A_ABF", "X1C0_classe", "X1C_classe",
        "X1D0_derogation", "X1D_derogation", "X1E0_environnement", "X1E_environnement",
        "X1L0_legislation", "X1L_legislation", "X1T0_eau", "X1T_eau",
        "X1U0_raccordement", "X1U_raccordement", "X1V0_toiture", "X1V_toiture",
        "X2C_classe", "X2H_historique", "X2R_remarquable",
    }

    ALL_TEXT_FIELDS = {
        "C2ZA7_autres", "C2ZD1_description", "C2ZE1_puissance", "C2ZP1_crete", "C2ZR1_destination",
        "C5ZA1_logements", "C5ZA2_individuels", "C5ZA3_collectifs",
        "C5ZC1_nombreLLS", "C5ZC2_nombreAS", "C5ZC3_nombrePTZ", "C5ZC5_nombreautres",
        "C5ZH1_agees", "C5ZH2_etudiants", "C5ZH3_tourisme", "C5ZH4_residence",
        "C5ZH5_sociale", "C5ZH6_handicapes", "C5ZH8_autresprecision",
        "C5ZI1_chambres", "C5ZI2_1piece", "C5ZI3_2pieces", "C5ZI4_3pieces",
        "C5ZI5_4pieces", "C5ZI6_5pieces", "C5ZI7_6pieces",
        "C5ZJ1_niveaux", "C5ZJ2_dessous",
        "D1A_naissance", "D1C_commune", "D1D_dept", "D1E_pays", "D1N_nom", "D1P_prenom",
        "D2D_denomination", "D2J_type", "D2N_nom", "D2P_prenom", "D2R_raison", "D2S_siret",
        "D3B_boite", "D3C_code", "D3D_division", "D3K_indicatif", "D3L_localite",
        "D3N_numero", "D3P_pays", "D3T_telephone", "D3V_voie", "D3W_lieudit", "D3X_cedex",
        "D5GE1_email", "D5GE2_email", "D5T_total",
        "E1D_date", "E1L_lieu", "E1S_signature",
        "M2C_dept", "M2D_dossier", "M2E_date", "M2K_commune", "M2M_cachet", "M2S_annee",
        "N1FCA_formulaire", "N1NCA_numero",
        "R2A_numero", "R2M_date", "R2N_deposant", "R3A_cachet",
        "S1A_stationnementavant", "S1B_nombre", "S1G_bati", "S1H_surface", "S1I_emprise",
        "S1LA1_localite", "S1LA2_localite", "S1M_stationnementapres",
        "S1NA1_numero", "S1NA2_numero", "S1PA1_codepostal", "S1PA2_codepostal",
        "S1VA1_voie", "S1VA2_voie", "S1WA1_lieudit", "S1WA2_lieudit",
        "T2C_code", "T2FP2_prefixe", "T2FP3_prefixe", "T2F_prefixe",
        "T2L_localite", "T2NP2_numero", "T2NP3_numero", "T2N_numero", "T2Q_numero",
        "T2SP2_section", "T2SP3_section", "T2S_section",
        "T2TP2_superficie", "T2TP3_superficie", "T2T_superficie", "T2V_voie", "T2W_lieudit",
        "T3N_dates",
        "V1B_boite", "V1C_code", "V1D_division", "V1EM1_email", "V1EM2_email", "V1E_pays",
        "V1L_localite", "V1MD1_denomination", "V1MN1_nom", "V1MP1_prenom",
        "V1MS1_siret", "V1MT1_typesociete", "V1N_nom", "V1P_prenom", "V1R_raison",
        "V1V_voie", "V1W_lieudit", "V1X_cedex", "V1Z_numero",
        "W3ES1_avanttravaux", "W3ES2_creee", "W3ES3_supprimee",
        "X1P_precisions",
    }
    # W2 surface grid (25 rows × 6 cols = 150 fields) added dynamically
    for _row in "ABCDEFGHIJKLMNPQRSTUVWXY":
        for _col in "ABCDEF":
            ALL_TEXT_FIELDS.add(f"W2{_row}{_col}1")

    # ======================================================================
    #  SECTION 2 : MAPPING DONNÉES FORMULAIRE WEB → CHAMPS ACROFORM
    # ======================================================================
    @classmethod
    def map_form_to_acroform(cls, data):
        """Convertit les données du formulaire Urbania en dict {acroform_field: value}.
        Couvre les 375 champs du PDF CERFA 16702-02.
        """
        m = {}

        # ── Helpers ──
        def s(key, default=""):
            return str(data.get(key, default) or "").strip()

        # ── DÉCLARANT PARTICULIER ──
        m["D1N_nom"] = s("nom").upper()
        m["D1P_prenom"] = s("prenom").capitalize()
        m["D1A_naissance"] = s("dateNaissance")
        m["D1C_commune"] = s("lieuNaissance")
        m["D1D_dept"] = s("codePostal", "")[:3]
        m["D1E_pays"] = s("pays", "France")

        # ── DÉCLARANT PERSONNE MORALE ──
        m["D2D_denomination"] = s("denomination")
        m["D2R_raison"] = s("raisonSociale")
        m["D2J_type"] = s("typeSociete")
        m["D2S_siret"] = s("siret")
        m["D2N_nom"] = s("representantNom").upper()
        m["D2P_prenom"] = s("representantPrenom").capitalize()

        # ── COORDONNÉES DÉCLARANT ──
        m["D3N_numero"] = s("numero")
        m["D3V_voie"] = s("adresse")
        m["D3W_lieudit"] = s("lieuDit")
        m["D3L_localite"] = s("localite", s("ville"))
        m["D3C_code"] = s("codePostal")
        m["D3B_boite"] = s("boitePostale")
        m["D3X_cedex"] = s("cedex")
        tel = s("telephone").replace(" ", "").replace(".", "").replace("-", "")
        if tel.startswith("+33"):
            tel = "0" + tel[3:]
        m["D3T_telephone"] = tel
        m["D3K_indicatif"] = "+33" if s("pays", "France") == "France" else s("indicatifPays")
        m["D3P_pays"] = s("pays", "France")
        m["D3D_division"] = s("divisionTerritoriale")
        # Email déclarant — séparé au niveau du @ (le PDF a déjà le @ imprimé)
        email = s("email")
        if "@" in email:
            parts = email.split("@", 1)
            m["D5GE1_email"] = parts[0]    # fredy
            m["D5GE2_email"] = parts[1]    # gmail.com
        else:
            m["D5GE1_email"] = email
            m["D5GE2_email"] = ""
        m["D5A_acceptation"] = "/Oui"

        # ── RÉCÉPISSÉ / NOM DÉPOSANT ──
        nom_complet = f"{s('prenom').capitalize()} {s('nom').upper()}".strip()
        m["R2N_deposant"] = nom_complet

        # ── TERRAIN ──
        m["T2Q_numero"] = s("terrainNumero")
        m["T2V_voie"] = s("terrainAdresse")
        m["T2W_lieudit"] = s("terrainLieuDit")
        m["T2L_localite"] = s("terrainVille")
        m["T2C_code"] = s("terrainCodePostal")
        # Parcelle cadastrale 1
        m["T2F_prefixe"] = s("prefixeCadastral")
        m["T2S_section"] = s("sectionCadastrale", s("section"))
        m["T2N_numero"] = s("numeroParcelle")
        m["T2T_superficie"] = s("surfaceTerrain")
        # Parcelle cadastrale 2
        m["T2FP2_prefixe"] = s("parcelle2Prefixe")
        m["T2SP2_section"] = s("parcelle2Section")
        m["T2NP2_numero"] = s("parcelle2Numero")
        m["T2TP2_superficie"] = s("parcelle2Superficie")
        # Parcelle cadastrale 3
        m["T2FP3_prefixe"] = s("parcelle3Prefixe")
        m["T2SP3_section"] = s("parcelle3Section")
        m["T2NP3_numero"] = s("parcelle3Numero")
        m["T2TP3_superficie"] = s("parcelle3Superficie")

        # ── SITUATION JURIDIQUE 3.2 ──
        def t3(key):
            v = s(key, "nsp").lower()
            return "oui" if v == "oui" else ("non" if v == "non" else "nsp")

        cu = t3("certificatUrbanisme")
        m["T3A_CUoui"] = "/Oui" if cu == "oui" else ""
        m["T3H_CUnon"] = "/Oui" if cu == "non" else ""
        m["T3B_CUnc"]  = "/Oui" if cu == "nsp" else ""

        pup = t3("perimetrePUP")
        m["T3P_PUPoui"] = "/Oui" if pup == "oui" else ""
        m["T3C_PUPnon"] = "/Oui" if pup == "non" else ""
        m["T3F_PUPnc"]  = "/Oui" if pup == "nsp" else ""

        afu = t3("remembrement")
        m["T3G_AFUoui"] = "/Oui" if afu == "oui" else ""
        m["T3R_AFUnon"] = "/Oui" if afu == "non" else ""
        m["T3E_AFUnc"]  = "/Oui" if afu == "nsp" else ""

        lot = t3("lotissement")
        m["T3I_lotoui"] = "/Oui" if lot == "oui" else ""
        m["T3L_lotnon"] = "/Oui" if lot == "non" else ""
        m["T3S_lotnc"]  = "/Oui" if lot == "nsp" else ""

        zac = t3("zoneZAC")
        m["T3J_ZACoui"] = "/Oui" if zac == "oui" else ""
        m["T3Q_ZACnon"] = "/Oui" if zac == "non" else ""
        m["T3T_ZACnc"]  = "/Oui" if zac == "nsp" else ""

        m["T3N_dates"] = s("dateLotissement")

        # ── NATURE DES TRAVAUX ──
        nature_list = data.get("natureTravaux", [])
        if isinstance(nature_list, str):
            nature_list = [nature_list]
        nature_set = {n.lower().strip() for n in nature_list if n}

        # Cases nature
        is_new = any(t in nature_set for t in ["piscine", "abri_jardin", "garage", "terrasse", "nouvelle_construction"])
        is_existing = any(t in nature_set for t in ["extension", "surelevation", "veranda", "transformation"])
        is_cloture = "cloture" in nature_set

        m["C2ZA1_nouvelle"] = "/Oui" if is_new else ""
        m["C2ZB1_existante"] = "/Oui" if is_existing else ""
        m["C2ZC3_cloture"] = "/Oui" if is_cloture else ""
        m["C2ZD1_description"] = s("descriptionProjet")
        m["C2ZA7_autres"] = s("autresPrecisions")

        # Type de résidence
        residence = s("typeResidence", "").lower()
        m["C2ZF1_principale"] = "/Oui" if "principale" in residence else ""
        m["C2ZF2_secondaire"] = "/Oui" if "secondaire" in residence else ""

        # ── TYPE DE TRAVAUX (cases spécifiques) ──
        m["C5ZE1_piscine"] = "/Oui" if "piscine" in nature_set else ""
        m["C5ZE2_garage"] = "/Oui" if "garage" in nature_set else ""
        m["C5ZE3_veranda"] = "/Oui" if "veranda" in nature_set else ""
        m["C5ZE4_abri"] = "/Oui" if "abri_jardin" in nature_set else ""
        m["C5ZE5_annexes"] = "/Oui" if any(t in nature_set for t in ["terrasse", "autre_annexe"]) else ""
        m["C5ZE6_piece"] = "/Oui" if "piece_supplementaire" in nature_set else ""
        m["C5ZK1_extension"] = "/Oui" if "extension" in nature_set else ""
        m["C5ZK2_surelevation"] = "/Oui" if "surelevation" in nature_set else ""
        m["C5ZK3_supplementaires"] = "/Oui" if "niveaux_supplementaires" in nature_set else ""

        # Mode d'utilisation
        mode = s("modeUtilisation", "").lower()
        m["C5ZD1_personnel"] = "/Oui" if "personnel" in mode or "occupation" in mode else ""
        m["C5ZD2_vente"] = "/Oui" if "vente" in mode else ""
        m["C5ZD3_location"] = "/Oui" if "location" in mode else ""

        # ── LOGEMENTS ──
        m["C5ZA1_logements"] = s("nombreLogements")
        m["C5ZA2_individuels"] = s("logementsIndividuels")
        m["C5ZA3_collectifs"] = s("logementsCollectifs")
        m["C5ZC1_nombreLLS"] = s("logementLocatifSocial")
        m["C5ZC2_nombreAS"] = s("accessionSociale")
        m["C5ZC3_nombrePTZ"] = s("pretTauxZero")
        m["C5ZC5_nombreautres"] = s("autresFinancements")

        # Hébergement spécialisé
        m["C5ZH1_agees"] = s("residenceAgees")
        m["C5ZH2_etudiants"] = s("residenceEtudiants")
        m["C5ZH3_tourisme"] = s("residenceTourisme")
        m["C5ZH4_residence"] = s("residenceHoteliere")
        m["C5ZH5_sociale"] = s("residenceSociale")
        m["C5ZH6_handicapes"] = s("residenceHandicapes")
        m["C5ZH8_autresprecision"] = s("residenceAutres")
        m["C5ZI1_chambres"] = s("nombreChambres")

        # Pièces (détail logements)
        m["C5ZI2_1piece"] = s("nb1piece")
        m["C5ZI3_2pieces"] = s("nb2pieces")
        m["C5ZI4_3pieces"] = s("nb3pieces")
        m["C5ZI5_4pieces"] = s("nb4pieces")
        m["C5ZI6_5pieces"] = s("nb5pieces")
        m["C5ZI7_6pieces"] = s("nb6pieces")

        # Niveaux
        m["C5ZJ1_niveaux"] = s("nombreNiveaux")
        m["C5ZJ2_dessous"] = s("nombreNiveauxDessous")

        # ── ÉNERGIE / AGRIVOLTAÏQUE ──
        m["C2ZE1_puissance"] = s("puissanceCrete")
        m["C2ZP1_crete"] = s("puissanceCrete")
        m["C2ZR1_destination"] = s("destinationEnergie")
        m["C2ZI0_agrivoltaique"] = "/Oui" if s("agrivoltaique", "").lower() in ("oui", "true", "1") else ""

        # ── MATÉRIAUX DE CONSTRUCTION ──
        mat = s("materiauFacade", "").lower()
        m["C6ZL1_modulaire"] = "/Oui" if "modulaire" in mat else ""
        m["C6ZL2_metal"] = "/Oui" if "metal" in mat or "métal" in mat else ""
        m["C6ZL3_bois"] = "/Oui" if "bois" in mat else ""
        m["C6ZL4_ciment"] = "/Oui" if any(x in mat for x in ["maçonnerie", "maconnerie", "ciment", "parpaing", "brique"]) else ""
        m["C6ZL5_beton"] = "/Oui" if "béton" in mat or "beton" in mat else ""
        # Fondations
        fond = s("typeFondation", "").lower()
        m["C6ZM1_classique"] = "/Oui" if "classique" in fond or not fond else ""
        m["C6ZM2_profond"] = "/Oui" if "profond" in fond else ""
        m["C6ZM3_terre"] = "/Oui" if "terre" in fond else ""

        # ── DESTINATION BÂTIMENT (cas spéciaux) ──
        dest = s("destination", "").lower()
        m["B1B_special"] = "/Oui" if "special" in dest else ""
        m["B1F_culture"] = "/Oui" if "culture" in dest or "loisir" in dest else ""
        m["B1G_transport"] = "/Oui" if "transport" in dest else ""
        m["B1K_social"] = "/Oui" if "social" in dest else ""
        m["B1L_enseignement"] = "/Oui" if "enseignement" in dest or "recherche" in dest else ""
        m["B1S_sante"] = "/Oui" if "sante" in dest or "santé" in dest else ""

        # ── EMPRISE AU SOL ──
        m["W3ES1_avanttravaux"] = s("empriseSolExistante")
        m["W3ES2_creee"] = s("empriseSolCreee")
        m["W3ES3_supprimee"] = s("empriseSolSupprimee")

        # ── TABLEAU DES SURFACES (W2 grid) ──
        # Lignes officielles CERFA 16702-02 :
        # A exploitation agricole
        # B exploitation forestière
        # C logement
        # D hébergement
        # E artisanat et commerce de détail
        # F restauration
        # G commerce de gros
        # H activités de services où s'effectue l'accueil d'une clientèle
        # I cinéma
        # J hôtels
        # K autres hébergements touristiques
        # L locaux et bureaux accueillant du public des administrations publiques et assimilés
        # M locaux techniques et industriels des administrations publiques et assimilés
        # N établissements d'enseignement, de santé et d'action sociale
        # P salles d'art et de spectacles
        # Q équipements sportifs
        # R lieux de culte
        # S autres équipements recevant du public
        # T industrie
        # U entrepôt
        # V bureau
        # W centre de congrès et d'exposition
        # X cuisine dédiée à la vente en ligne
        # Y total
        # Colonnes : A=existante, B=créée, C=créée par changement de destination,
        # D=supprimée, E=supprimée par changement de destination, F=totale.
        row_values = {}

        def parse_num(key, *fallbacks):
            candidates = (key, *fallbacks)
            for candidate in candidates:
                raw = data.get(candidate)
                if raw in (None, ""):
                    continue
                try:
                    return float(str(raw).replace(",", ".").strip())
                except Exception:
                    continue
            return 0.0

        def fmt_num(value):
            if abs(value) < 1e-9:
                return ""
            return str(int(value)) if float(value).is_integer() else f"{value:.2f}".rstrip("0").rstrip(".")

        def set_row(row, existante=0.0, creee=0.0, creee_chgt=0.0, supprimee=0.0, supprimee_chgt=0.0):
            total = existante + creee + creee_chgt - supprimee - supprimee_chgt
            values = {
                "A": existante,
                "B": creee,
                "C": creee_chgt,
                "D": supprimee,
                "E": supprimee_chgt,
                "F": total,
            }
            for col, val in values.items():
                text = fmt_num(val)
                if text:
                    m[f"W2{row}{col}1"] = text
            row_values[row] = values

        destination_row_map = {
            "exploitation_agricole": "A",
            "exploitation_forestiere": "B",
            "habitation": "C",
            "hebergement": "D",
            "commerce_activite": "E",
            "artisanat_commerce_detail": "E",
            "restauration": "F",
            "commerce_gros": "G",
            "service_clientele": "H",
            "cinema": "I",
            "hotels": "J",
            "hebergements_touristiques": "K",
            "equipement_collectif": "L",
            "administration_publique": "L",
            "locaux_techniques_publics": "M",
            "enseignement_sante_social": "N",
            "spectacle": "P",
            "sport": "Q",
            "culte": "R",
            "autre_erp": "S",
            "industrie": "T",
            "entrepot": "U",
            "bureau": "V",
            "centre_congres": "W",
            "cuisine_ligne": "X",
            "autre": "W",
            "exploitation": "A",
        }

        def resolve_service_public_row():
            service_public = s("destinationServicePublic").lower()
            if not service_public or service_public == "aucun":
                return "L"
            if "enseignement" in service_public or "recherche" in service_public or "sant" in service_public or "social" in service_public:
                return "N"
            if "culture" in service_public or "loisir" in service_public:
                return "P"
            if "transport" in service_public or "ouvrage" in service_public or "technique" in service_public or "industriel" in service_public:
                return "M"
            return "L"

        def resolve_row(destination_value, nature_set_local):
            dest_value = (destination_value or "").strip().lower()
            if dest_value == "equipement_collectif":
                return resolve_service_public_row()
            if dest_value in destination_row_map:
                return destination_row_map[dest_value]
            if any(n in nature_set_local for n in {"extension", "surelevation", "veranda", "garage", "abri_jardin", "terrasse", "piscine", "nouvelle_construction"}):
                return "C"
            return "C"

        surfaces = data.get("surfaces", {})
        if isinstance(surfaces, dict):
            for row_key, row_data in surfaces.items():
                if isinstance(row_data, dict):
                    row_snapshot = {"A": 0.0, "B": 0.0, "C": 0.0, "D": 0.0, "E": 0.0, "F": 0.0}
                    for col_key, val in row_data.items():
                        field_id = f"W2{row_key}{col_key}1"
                        if field_id in cls.ALL_TEXT_FIELDS:
                            m[field_id] = str(val)
                            try:
                                row_snapshot[col_key] = float(str(val).replace(",", ".").strip())
                            except Exception:
                                row_snapshot[col_key] = 0.0
                    row_values[row_key] = row_snapshot

        # Fallback exact à partir des champs Urbania
        destination_actuelle = s("destinationActuelle", s("destination"))
        destination_future = s("destinationFuture")
        default_row = resolve_row(destination_future or destination_actuelle, nature_set)
        current_row = resolve_row(destination_actuelle, nature_set)
        future_row = resolve_row(destination_future, nature_set)

        existante_default = parse_num("surfacePlancherExistante")
        creee_default = parse_num("surfacePlancherCreee")
        supprimee_default = parse_num("surfacePlancherSupprimee")

        if not any(f"W2{row}{col}1" in m for row in "ABCDEFGHIJKLMNPQRSTUVWX" for col in "ABCDE"):
            set_row(default_row, existante=existante_default, creee=creee_default, supprimee=supprimee_default)

        # Cas résidentiel standard : logement / habitation
        if default_row == "C":
            logement_exist = parse_num("surfaceLogementExistante") + parse_num("surfaceAnnexeExistante")
            logement_cree = parse_num("surfaceLogementCreee") + parse_num("surfaceAnnexeCreee")
            logement_suppr = parse_num("surfaceLogementSupprimee") + parse_num("surfaceAnnexeSupprimee")
            if any(v > 0 for v in [logement_exist, logement_cree, logement_suppr]):
                set_row("C", existante=logement_exist, creee=logement_cree, supprimee=logement_suppr)

        # Changement de destination : colonne C pour la destination future, colonne E pour l'actuelle
        surface_transforme = parse_num("surfaceTransforme")
        if surface_transforme > 0:
            if current_row:
                current_existing = row_values.get(current_row, {}).get("A", 0.0)
                current_created = row_values.get(current_row, {}).get("B", 0.0)
                current_created_change = row_values.get(current_row, {}).get("C", 0.0)
                current_removed = row_values.get(current_row, {}).get("D", 0.0)
                current_removed_change = row_values.get(current_row, {}).get("E", 0.0) + surface_transforme
                set_row(current_row, current_existing, current_created, current_created_change, current_removed, current_removed_change)
            if future_row:
                future_existing = row_values.get(future_row, {}).get("A", 0.0)
                future_created = row_values.get(future_row, {}).get("B", 0.0)
                future_created_change = row_values.get(future_row, {}).get("C", 0.0) + surface_transforme
                future_removed = row_values.get(future_row, {}).get("D", 0.0)
                future_removed_change = row_values.get(future_row, {}).get("E", 0.0)
                set_row(future_row, future_existing, future_created, future_created_change, future_removed, future_removed_change)

        total_exist = sum(values["A"] for values in row_values.values())
        total_cree = sum(values["B"] for values in row_values.values())
        total_cree_chgt = sum(values["C"] for values in row_values.values())
        total_suppr = sum(values["D"] for values in row_values.values())
        total_suppr_chgt = sum(values["E"] for values in row_values.values())
        set_row("Y", total_exist, total_cree, total_cree_chgt, total_suppr, total_suppr_chgt)

        # ── STATIONNEMENT ──
        m["S1A_stationnementavant"] = s("placesAvant")
        m["S1M_stationnementapres"] = s("placesApres")
        m["S1B_nombre"] = s("nbPlacesStationnement")
        m["S1G_bati"] = s("surfaceBatieStationnement")
        m["S1H_surface"] = s("surfaceTotaleStationnement")
        m["S1I_emprise"] = s("empriseStationnement")
        # Adresse stationnement 1 (= terrain par défaut)
        m["S1NA1_numero"] = s("stationnementNumero", s("terrainNumero"))
        m["S1VA1_voie"] = s("stationnementAdresse", s("terrainAdresse"))
        m["S1WA1_lieudit"] = s("stationnementLieuDit", s("terrainLieuDit"))
        m["S1LA1_localite"] = s("stationnementVille", s("terrainVille"))
        m["S1PA1_codepostal"] = s("stationnementCodePostal", s("terrainCodePostal"))
        # Adresse stationnement 2
        m["S1NA2_numero"] = s("stationnement2Numero")
        m["S1VA2_voie"] = s("stationnement2Adresse")
        m["S1WA2_lieudit"] = s("stationnement2LieuDit")
        m["S1LA2_localite"] = s("stationnement2Ville")
        m["S1PA2_codepostal"] = s("stationnement2CodePostal")

        # ── PVR (Participation Voirie et Réseaux) = identique au déclarant ──
        m["V1N_nom"] = m["D1N_nom"]
        m["V1P_prenom"] = m["D1P_prenom"]
        m["V1Z_numero"] = m["D3N_numero"]
        m["V1V_voie"] = m["D3V_voie"]
        m["V1W_lieudit"] = m["D3W_lieudit"]
        m["V1L_localite"] = m["D3L_localite"]
        m["V1C_code"] = m["D3C_code"]
        m["V1B_boite"] = m["D3B_boite"]
        m["V1X_cedex"] = m["D3X_cedex"]
        m["V1E_pays"] = m["D3P_pays"]
        m["V1D_division"] = m["D3D_division"]
        m["V1EM1_email"] = m["D5GE1_email"]
        m["V1EM2_email"] = m.get("D5GE2_email", "")
        m["V1R_raison"] = m["D2R_raison"]
        m["V1MD1_denomination"] = m["D2D_denomination"]
        m["V1MN1_nom"] = m["D2N_nom"]
        m["V1MP1_prenom"] = m["D2P_prenom"]
        m["V1MS1_siret"] = m["D2S_siret"]
        m["V1MT1_typesociete"] = m["D2J_type"]

        # ── ENGAGEMENT & SIGNATURE ──
        m["E1L_lieu"] = s("lieuDeclaration", s("ville"))
        m["E1D_date"] = s("dateDeclaration")

        # ── LÉGISLATIONS CONNEXES (Section 5) ──
        # Pattern : champ_0 = Non coché, champ = Oui coché
        def yn(key, default="non"):
            v = s(key, default).lower()
            return "oui" if v in ("oui", "true", "1", "yes") else "non"

        iota = yn("iota")
        m["X1T_eau"]   = "/Oui" if iota == "oui" else ""
        m["X1T0_eau"]  = "/Oui" if iota == "non" else ""

        env_aut = yn("autorisationEnv")
        m["X1E_environnement"]  = "/Oui" if env_aut == "oui" else ""
        m["X1E0_environnement"] = "/Oui" if env_aut == "non" else ""

        dero = yn("derogationEspeces")
        m["X1D_derogation"]  = "/Oui" if dero == "oui" else ""
        m["X1D0_derogation"] = "/Oui" if dero == "non" else ""

        icpe = yn("enregistrement")
        m["X1C_classe"]  = "/Oui" if icpe == "oui" else ""
        m["X1C0_classe"] = "/Oui" if icpe == "non" else ""

        abf_val = yn("avisABF")
        m["X1A_ABF"]  = "/Oui" if abf_val == "oui" else ""
        m["X1A0_ABF"] = "/Oui" if abf_val == "non" else ""

        autre_leg = yn("autreLegislations")
        m["X1L_legislation"]  = "/Oui" if autre_leg == "oui" else ""
        m["X1L0_legislation"] = "/Oui" if autre_leg == "non" else ""
        m["X1P_precisions"] = s("precisezAutreLegislations")

        racco = yn("raccordementChaleur")
        m["X1U_raccordement"]  = "/Oui" if racco == "oui" else ""
        m["X1U0_raccordement"] = "/Oui" if racco == "non" else ""

        art_l171 = yn("articleL1714")
        m["X1V_toiture"]  = "/Oui" if art_l171 == "oui" else ""
        m["X1V0_toiture"] = "/Oui" if art_l171 == "non" else ""

        # ── PÉRIMÈTRES DE PROTECTION (Section 5 — cases indépendantes) ──
        m["X2R_remarquable"] = "/Oui" if s("sitePatrimonialRemarquable", "non").lower() in ("oui", "true", "1") else ""
        m["X2H_historique"]  = "/Oui" if s("abordsMonumentHistorique", "non").lower() in ("oui", "true", "1") else ""
        m["X2C_classe"]      = "/Oui" if s("siteClasse", "non").lower() in ("oui", "true", "1") else ""

        # Nettoyage : supprimer les vides
        return {k: v for k, v in m.items() if v and v.strip()}

    # ======================================================================
    #  SECTION 3 : FILTRAGE DYNAMIQUE PAR TYPE DE PROJET
    # ======================================================================
    @classmethod
    def get_fields_for_project(cls, nature_travaux, description=""):
        """Retourne les champs AcroForm pertinents pour le type de projet donné.
        Pour les projets connus (piscine, garage…), utilise les profils hardcodés.
        Pour les projets inconnus ('autre'), utilise Mistral AI.
        """
        if isinstance(nature_travaux, str):
            nature_travaux = [nature_travaux]

        nature_set = {n.lower().strip() for n in nature_travaux if n}
        relevant_fields = set(cls.COMMON_FIELDS) | cls.LEGISLATIONS_FIELDS

        known_found = False
        for nature in nature_set:
            if nature in cls.PROJECT_PROFILES:
                known_found = True
                profile = cls.PROJECT_PROFILES[nature]
                relevant_fields.update(profile.get("checkboxes", set()))
                relevant_fields.update(profile.get("text_fields", set()))
                if profile.get("surfaces"):
                    # Ajouter tout le tableau W2
                    for row in "ABCDEFGHIJKLMNPQRSTUVWXY":
                        for col in "ABCDEF":
                            relevant_fields.add(f"W2{row}{col}1")
                if profile.get("stationnement"):
                    relevant_fields.update({
                        "S1A_stationnementavant", "S1M_stationnementapres",
                        "S1B_nombre", "S1G_bati", "S1H_surface", "S1I_emprise",
                        "S1NA1_numero", "S1VA1_voie", "S1WA1_lieudit",
                        "S1LA1_localite", "S1PA1_codepostal",
                    })
                if profile.get("voirie"):
                    relevant_fields.update({f for f in cls.ALL_TEXT_FIELDS if f.startswith("V1")})

        # Si "autre" ou projet inconnu → appel Mistral AI
        if not known_found or "autre" in nature_set:
            ai_fields = cls._get_ai_fields(description or ", ".join(nature_set))
            relevant_fields.update(ai_fields)

        return relevant_fields

    @classmethod
    def _get_ai_fields(cls, description):
        """Utilise Mistral AI pour déterminer les champs CERFA pertinents
        pour un type de projet inconnu ('Autre').
        """
        try:
            from .ai_service import AIService
        except ImportError:
            logger.warning("AIService non disponible pour le filtrage dynamique")
            return set()

        all_field_ids = sorted(cls.ALL_CHECKBOX_FIELDS | cls.ALL_TEXT_FIELDS)
        field_list = "\n".join(all_field_ids)

        prompt = f"""Tu es un expert en urbanisme français et en formulaires CERFA.

Le projet de l'utilisateur est : "{description}"

Voici la liste COMPLÈTE des champs du formulaire CERFA 16702-02 (déclaration préalable) :
{field_list}

CONSIGNE : Retourne UNIQUEMENT la liste des identifiants de champs qui sont PERTINENTS et NÉCESSAIRES pour ce type de projet. Un champ par ligne, rien d'autre. Pas d'explication.

Les champs communs (identité D1/D2/D3, terrain T2, engagement E1) sont déjà inclus automatiquement.
Concentre-toi sur les champs spécifiques au type de construction :
- C2Z* (nature des travaux)
- C5Z* (type, logements, niveaux)
- C6Z* (matériaux, fondations)
- B1* (destination bâtiment)
- S1* (stationnement)
- W2* (tableau des surfaces) — liste uniquement "W2_SURFACES" si le tableau est nécessaire
- W3* (emprise au sol)
- X1*/X2* (autorisations spéciales)
- P* (pièces jointes requises)
"""
        try:
            import requests
            api_key = os.environ.get("MISTRAL_API_KEY", "")
            if not api_key:
                logger.warning("MISTRAL_API_KEY manquant pour le filtrage IA")
                return cls.ALL_CHECKBOX_FIELDS | cls.ALL_TEXT_FIELDS

            response = requests.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "mistral-small-latest",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                },
                timeout=30,
            )

            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                ai_fields = set()
                for line in content.strip().split("\n"):
                    field_id = line.strip()
                    if field_id == "W2_SURFACES":
                        for row in "ABCDEFGHIJKLMNPQRSTUVWXY":
                            for col in "ABCDEF":
                                ai_fields.add(f"W2{row}{col}1")
                    elif field_id in cls.ALL_CHECKBOX_FIELDS or field_id in cls.ALL_TEXT_FIELDS:
                        ai_fields.add(field_id)
                logger.info(f"Mistral AI a sélectionné {len(ai_fields)} champs pour '{description}'")
                return ai_fields
            else:
                logger.error(f"Erreur Mistral: {response.status_code} {response.text}")
                return cls.ALL_CHECKBOX_FIELDS | cls.ALL_TEXT_FIELDS

        except Exception as e:
            logger.error(f"Erreur appel Mistral pour filtrage champs: {e}")
            return cls.ALL_CHECKBOX_FIELDS | cls.ALL_TEXT_FIELDS

    # ======================================================================
    #  SECTION 4 : GÉNÉRATION PDF (AcroForms injection + fusion images DP)
    # ======================================================================
    @classmethod
    def generate_pdf(cls, project_data, user_id, pieces_jointes=None):
        """Génère le PDF CERFA rempli via injection AcroForms + pages DP.

        1. Mapper données web → champs AcroForm
        2. Filtrer selon type de projet
        3. Injecter dans le PDF template
        4. Fusionner les images DP comme pages supplémentaires
        5. Retourner le chemin du PDF final
        """
        if not PYPDF2_OK:
            raise RuntimeError("PyPDF2 non installé — pip install PyPDF2")

        # Créer le dossier de sortie
        cls.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # 1. Mapper les données
        all_mapped = cls.map_form_to_acroform(project_data)
        logger.info(f"Champs mappés: {len(all_mapped)}")

        # 2. Filtrer selon type de projet
        nature = project_data.get("natureTravaux", [])
        description = project_data.get("descriptionProjet", "")
        relevant = cls.get_fields_for_project(nature, description)

        # Ne garder que les champs pertinents
        filtered = {k: v for k, v in all_mapped.items() if k in relevant or k in cls.COMMON_FIELDS}
        logger.info(f"Champs après filtrage: {len(filtered)} (sur {len(all_mapped)} mappés)")

        # 3. Injecter dans le PDF via manipulation directe des annotations
        reader = PdfReader(str(cls.TEMPLATE_PDF))
        writer = PdfWriter()

        # Cloner les pages
        for page in reader.pages:
            writer.add_page(page)

        # Copier l'AcroForm globale pour préserver la structure
        if '/AcroForm' in reader.trailer['/Root']:
            writer._root_object.update({
                NameObject('/AcroForm'): reader.trailer['/Root']['/AcroForm']
            })

        # Injecter les valeurs directement dans les annotations de chaque page
        filled_count = 0
        for page in writer.pages:
            annots_raw = page.get('/Annots')
            if annots_raw is None:
                continue
            annots = annots_raw.get_object() if hasattr(annots_raw, 'get_object') else annots_raw
            if not hasattr(annots, '__iter__'):
                continue

            for annot_ref in annots:
                annot = annot_ref.get_object() if hasattr(annot_ref, 'get_object') else annot_ref
                field_name = str(annot.get('/T', ''))
                field_type = str(annot.get('/FT', ''))

                if field_name not in filtered:
                    continue

                val = filtered[field_name]

                if field_type == '/Btn':
                    # Checkbox : activer avec /Oui (PDF français — état = /Oui pas /Yes)
                    if val == "/Oui":
                        annot.update({
                            NameObject('/V'): NameObject('/Oui'),
                            NameObject('/AS'): NameObject('/Oui'),
                        })
                else:
                    # Champ texte : injecter la valeur
                    annot.update({
                        NameObject('/V'): TextStringObject(val),
                    })
                filled_count += 1

        logger.info(f"Champs injectés dans le PDF: {filled_count}")

        # Sauvegarder le PDF CERFA rempli
        timestamp = int(time.time())
        cerfa_filename = f"cerfa_{user_id}_{timestamp}.pdf"
        cerfa_path = cls.OUTPUT_DIR / cerfa_filename

        with open(cerfa_path, "wb") as f:
            writer.write(f)

        logger.info(f"PDF CERFA sauvegardé: {cerfa_path}")

        # 4. Fusionner les images DP si fournies
        if pieces_jointes:
            cerfa_path = cls._merge_dp_images(cerfa_path, pieces_jointes, user_id, timestamp)

        # 5. Overlay signature numérique si fournie
        signature_b64 = project_data.get("signature") or project_data.get("signatureImage")
        if signature_b64:
            cerfa_path = cls._overlay_signature_image(cerfa_path, signature_b64)

        return str(cerfa_path)

    @classmethod
    def _merge_dp_images(cls, cerfa_pdf_path, pieces_jointes, user_id, timestamp):
        """Fusionne les images DP (base64) comme pages supplémentaires du PDF."""
        if not REPORTLAB_OK or not PILLOW_OK:
            logger.warning("ReportLab/Pillow non disponibles — pas de fusion images")
            return cerfa_pdf_path

        from PyPDF2 import PdfMerger

        merger = PdfMerger()
        merger.append(str(cerfa_pdf_path))

        dp_order = ["dp1", "dp2", "dp3", "dp4", "dp5", "dp6", "dp7", "dp8"]
        added = 0

        for dp_key in dp_order:
            img_data = pieces_jointes.get(dp_key)
            if not img_data:
                continue

            try:
                # Décoder le base64
                if "base64," in img_data:
                    img_data = img_data.split("base64,")[1]
                raw = base64.b64decode(img_data)

                # Convertir en image Pillow
                img = Image.open(io.BytesIO(raw))
                img = img.convert("RGB")
                w, h = img.size

                # Créer une page PDF avec l'image
                img_buf = io.BytesIO()
                c = rl_canvas.Canvas(img_buf, pagesize=A4)
                page_w, page_h = A4

                # Adapter l'image à la page A4 - UTILISER MOINS D'ESPACE DISPONIBLE POUR RÉDUIRE LA TAILLE
                margin = 18  # Marges augmentées (0.25 inch)
                max_w = page_w - 2 * margin
                max_h = page_h - 2 * margin - 12  # Très peu d'espace pour le titre
                scale = min(max_w / w, max_h / h)
                draw_w = w * scale
                draw_h = h * scale
                x = (page_w - draw_w) / 2
                y = (page_h - draw_h) / 2

                # Titre
                c.setFont("Helvetica-Bold", 14)
                c.drawCentredString(page_w / 2, page_h - 30, f"Pièce jointe : {dp_key.upper()}")

                # Dessiner l'image
                img_path_tmp = io.BytesIO()
                img.save(img_path_tmp, "PNG")
                img_path_tmp.seek(0)

                from reportlab.lib.utils import ImageReader
                c.drawImage(ImageReader(img_path_tmp), x, y, draw_w, draw_h)
                c.showPage()
                c.save()
                img_buf.seek(0)

                merger.append(img_buf)
                added += 1
                logger.info(f"Image {dp_key} ajoutée au PDF")

            except Exception as e:
                logger.error(f"Erreur fusion image {dp_key}: {e}")

        if added > 0:
            final_filename = f"cerfa_complet_{user_id}_{timestamp}.pdf"
            final_path = cls.OUTPUT_DIR / final_filename
            merger.write(str(final_path))
            merger.close()
            logger.info(f"PDF final avec {added} images DP: {final_path}")
            return final_path

        merger.close()
        return cerfa_pdf_path

    @classmethod
    def _overlay_signature_image(cls, pdf_path, signature_b64):
        """
        Superpose l'image de signature sur le champ E1S_signature du PDF CERFA.
        Fonctionne même si le champ n'accepte que du texte : on dessine l'image
        en overlay (reportlab) puis on la fusionne sur la page via merge_page.
        """
        if not REPORTLAB_OK or not PILLOW_OK:
            logger.warning("ReportLab/Pillow non disponibles — signature non appliquée")
            return pdf_path

        try:
            from reportlab.lib.utils import ImageReader

            # 1. Décoder la signature base64
            img_data = signature_b64
            if "base64," in img_data:
                img_data = img_data.split("base64,")[1]
            raw = base64.b64decode(img_data)
            sig_img = Image.open(io.BytesIO(raw)).convert("RGBA")

            # Fond blanc pour éviter transparence noire dans le PDF
            bg = Image.new("RGBA", sig_img.size, (255, 255, 255, 255))
            bg.paste(sig_img, mask=sig_img.split()[3])
            sig_rgb = bg.convert("RGB")
            sig_buf = io.BytesIO()
            sig_rgb.save(sig_buf, "PNG")
            sig_buf.seek(0)

            # 2. Localiser le champ E1S_signature dans le PDF (n° de page + rect)
            reader = PdfReader(str(pdf_path))
            sig_rect = None
            sig_page_idx = None

            for page_idx, page in enumerate(reader.pages):
                annots_raw = page.get("/Annots")
                if not annots_raw:
                    continue
                annots = annots_raw.get_object() if hasattr(annots_raw, "get_object") else annots_raw
                if not hasattr(annots, "__iter__"):
                    continue
                for annot_ref in annots:
                    annot = annot_ref.get_object() if hasattr(annot_ref, "get_object") else annot_ref
                    if str(annot.get("/T", "")) == "E1S_signature":
                        rect = annot.get("/Rect")
                        if rect:
                            sig_rect = [float(rect[i]) for i in range(4)]
                            sig_page_idx = page_idx
                        break
                if sig_page_idx is not None:
                    break

            if sig_rect is None:
                logger.warning("Champ E1S_signature non trouvé — signature positionnée en bas de dernière page CERFA")
                # Fallback : bas de la dernière page CERFA (page 9 ≈ index 8)
                target_idx = min(8, len(reader.pages) - 1)
                page_obj = reader.pages[target_idx]
                pw = float(page_obj.mediabox.width)
                sig_rect = [pw * 0.5, 60, pw * 0.85, 130]
                sig_page_idx = target_idx

            # 3. Créer la page d'overlay (une seule page à la taille de la page cible)
            page_obj = reader.pages[sig_page_idx]
            pw = float(page_obj.mediabox.width)
            ph = float(page_obj.mediabox.height)

            overlay_buf = io.BytesIO()
            c = rl_canvas.Canvas(overlay_buf, pagesize=(pw, ph))

            x0, y0, x1, y1 = sig_rect
            pad = 4
            draw_x = x0 + pad
            draw_y = y0 + pad
            draw_w = (x1 - x0) - 2 * pad
            draw_h = (y1 - y0) - 2 * pad

            if draw_w > 0 and draw_h > 0:
                c.drawImage(
                    ImageReader(sig_buf),
                    draw_x, draw_y, draw_w, draw_h,
                    preserveAspectRatio=True,
                    mask="auto"
                )

            c.showPage()
            c.save()
            overlay_buf.seek(0)

            # 4. Fusionner l'overlay sur la page cible
            overlay_reader = PdfReader(overlay_buf)
            writer = PdfWriter()

            for i, page in enumerate(reader.pages):
                if i == sig_page_idx and len(overlay_reader.pages) > 0:
                    page.merge_page(overlay_reader.pages[0])
                writer.add_page(page)

            # Copier l'AcroForm pour préserver les autres champs
            if "/AcroForm" in reader.trailer["/Root"]:
                writer._root_object.update({
                    NameObject("/AcroForm"): reader.trailer["/Root"]["/AcroForm"]
                })

            signed_filename = str(pdf_path).replace(".pdf", "_signed.pdf")
            with open(signed_filename, "wb") as f:
                writer.write(f)

            logger.info(f"Signature appliquée sur page {sig_page_idx + 1} → {signed_filename}")
            return signed_filename

        except Exception as e:
            logger.error(f"Erreur overlay signature: {e}", exc_info=True)
            return pdf_path
