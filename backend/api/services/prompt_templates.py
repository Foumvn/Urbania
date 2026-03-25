"""
Prompt Templates pour la génération d'images DP2-DP6
Style JSON structuré inspiré de RAS, personnalisé par type de projet et DP
"""

DP_TEMPLATES = {
    "dp2": {
        "default": {
            "project_type": "Architectural Plan - Plan de Masse (DP2)",
            "document_title": {
                "text": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN DE MASSE (DP2)",
                "font_style": "Clear, technical sans-serif font"
            },
            "overall_scene": {
                "format": "Technical, computer-generated architectural site plan (Plan de Masse)",
                "perspective": "Top-down orthographic view",
                "background": "Clean white document background, with a prominent border around the drawing area",
                "rendering_style": "Clean vector lines with subtle, professional shading and textures"
            },
            "property_layout": {
                "boundary": {
                    "type": "Layered and structured green hedge with integrated dry stone wall coping",
                    "form": "Encloses the entire visible plot with a prominent border"
                },
                "existing_house": {
                    "label": "Maison existante",
                    "texture": "Clean light grey wooden composite planks",
                    "position": "$position_maison"
                },
                "new_structure": {
                    "label": "$project_label",
                    "type": "$project_type_display",
                    "dimensions": {
                        "width": "$largeur m",
                        "depth": "$longueur m",
                        "surface": "$surface m²"
                    },
                    "position": "$position_structure",
                    "materials": {
                        "walls": "$materiau_facade",
                        "roof": "$materiau_toiture",
                        "colors": "Walls: $couleur_facade, Roof: $couleur_toiture"
                    }
                },
                "site_access": {
                    "label": "Accès",
                    "location": "Main access to the property",
                    "texture": "Large modern concrete aggregate pavers"
                },
                "parking": {
                    "label": "Stationnement",
                    "spaces": "$nb_stationnement"
                },
                "landscaping": {
                    "label": "Espaces verts",
                    "type": "Detailed aggregate textured hardscaping and manicured lawn",
                    "surface": "$surface_verte m²"
                }
            },
            "annotations": {
                "labels": {
                    "maison_existante": "Maison existante",
                    "acces": "Accès",
                    "projet": "$project_label",
                    "stationnement": "Stationnement",
                    "espaces_verts": "Espaces verts",
                    "nfp_label": "NFP = TN + 0.10m"
                },
                "dimensions": [
                    "$largeur m",
                    "$longueur m",
                    "$distance_maison m",
                    "$emprise m²"
                ],
                "north_compass": {
                    "type": "Clean, vectorized architectural North-point compass rose",
                    "location": "Bottom left margin"
                },
                "scale": {
                    "label": "Échelle : 1/100",
                    "location": "Bottom center of border"
                }
            },
            "title_blocks": {
                "header_title": {
                    "text": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN DE MASSE (DP2)",
                    "location": "Top center of border"
                },
                "bottom_block": {
                    "cell1": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN DE MASSE (DP2)",
                    "cell2": "Échelle : 1/100",
                    "cell3": "Projet: $project_label - $surface m²"
                }
            }
        },
        "abri_jardin": {
            "project_label": "Abri de jardin",
            "project_type_display": "Garden shed / storage building",
            "description": "Abri de jardin de $longueur m x $largeur m, surface $surface m², hauteur $hauteur m",
            "specific_elements": {
                "usage": "$usageabri (usage: stockage, atelier, etc.)",
                "materiau": "Structure en $materiau_facade",
                "toiture": "Toiture $materiau_toiture $couleur_toiture"
            }
        },
        "piscine": {
            "project_label": "Piscine",
            "project_type_display": "In-ground swimming pool",
            "description": "Piscine de $longueur m x $largeur m, profondeur $profondeur m",
            "specific_elements": {
                "type": "Piscine enterrée rectangulaire",
                "water_texture": "Deep rich blue water pattern with mosaic tile details and integrated steps",
                "border": {
                    "material": "Polished minimalist concrete coping",
                    "dimensions": {
                        "total_width": "$largeur m",
                        "finished_pool_level_label": "NFP = TN + 0.10m"
                    }
                },
                "sections": {
                    "section_aa": {
                        "label": "COUPE AA",
                        "line": "Detailed section line across pool width with 'PROF. $profondeur m' dimension label"
                    },
                    "section_bb": {
                        "label": "COUPE BB",
                        "line": "Crossing detailed section line with '$longueur m' dimension label"
                    }
                }
            }
        },
        "garage": {
            "project_label": "Garage",
            "project_type_display": "Garage / Carport",
            "description": "Garage de $longueur m x $largeur m, $nb_vehicules véhicule(s)",
            "specific_elements": {
                "type": "Garage $type_garage",
                "nb_vehicules": "$nb_vehicules place(s)",
                "dimensions": "$longueur m x $largeur m"
            }
        },
        "terrasse": {
            "project_label": "Terrasse",
            "project_type_display": "Terrace",
            "description": "Terrasse de $longueur m x $largeur m, surface $surface m²",
            "specific_elements": {
                "type": "Terrasse $type_terrasse",
                "hauteur": "Hauteur: $hauteur m",
                "dimension": "$longueur m x $largeur m",
                "texture": "Large modern concrete aggregate pavers"
            }
        },
        "veranda": {
            "project_label": "Véranda",
            "project_type_display": "Conservatory / Veranda",
            "description": "Véranda de $longueur m x $largeur m, surface $surface m²",
            "specific_elements": {
                "dimensions": "$longueur m x $largeur m",
                "hauteur": "Hauteur: $hauteur m",
                "materiau": "Structure $materiau_facade, vitrage $type_vitrage"
            }
        },
        "extension": {
            "project_label": "Extension",
            "project_type_display": "Building extension",
            "description": "Extension de $longueur m x $largeur m, surface $surface m²",
            "specific_elements": {
                "dimensions": "$longueur m x $largeur m",
                "nb_niveaux": "$nb_niveaux niveau(x)",
                "materiau": "Murs: $materiau_facade, Toiture: $materiau_toiture"
            }
        },
        "hangar": {
            "project_label": "Hangar",
            "project_type_display": "Industrial warehouse / Storage building",
            "description": "Hangar de $longueur m x $largeur m, surface $surface m², hauteur $hauteur m",
            "specific_elements": {
                "type": "Hangar $type_hangar",
                "dimensions": "$longueur m x $largeur m",
                "hauteur": "Hauteur: $hauteur m",
                "usage": "$usage_hangar (usage: stockage, atelier, garage...)",
                "structure": "Structure $materiau_facade, toiture $materiau_toiture"
            }
        },
        "surelevation": {
            "project_label": "Surélévation",
            "project_type_display": "Building raise / Roof extension",
            "description": "Surélévation de $surface m², hauteur ajoutée $hauteur m",
            "specific_elements": {
                "dimensions": "Surface: $surface m²",
                "hauteur": "Hauteur ajoutée: $hauteur m",
                "nb_niveaux": "Nombre de niveaux: $nb_niveaux",
                "materiau": "Murs: $materiau_facade, Toiture: $materiau_toiture"
            }
        },
        "cloture": {
            "project_label": "Clôture",
            "project_type_display": "Fence",
            "description": "Clôture sur $longueur m de longueur, hauteur $hauteur m",
            "specific_elements": {
                "type": "Clôture $type_cloture",
                "longueur": "$longueur m",
                "hauteur": "$hauteur m",
                "design": "Layered hedge with integrated stone wall coping"
            }
        }
    },

    "dp3": {
        "default": {
            "project_type": "Architectural Plan - Plan en Coupe (DP3)",
            "document_title": {
                "text": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN EN COUPE (DP3)",
                "font_style": "Clear, technical sans-serif font"
            },
            "overall_scene": {
                "format": "Technical architectural cross-section (Plan en Coupe)",
                "perspective": "Vertical cutaway view showing internal structure",
                "background": "Clean white document background, with a prominent border",
                "rendering_style": "Clean vector lines, professional technical drawing with material hatching"
            },
            "cross_section": {
                "structure": {
                    "foundations": "Fondations en béton armé, profondeur $profondeur_fondation m",
                    "walls": "Murs en $materiau_facade, épaisseur $epaisseur_mur cm avec isolation thermique",
                    "floor": "Dalle béton / plancher $type_plancher sur hérisson ou vide sanitaire",
                    "roof": "Toiture $materiau_toiture $couleur_toiture avec charpente détaillée"
                },
                "dimensions": {
                    "width": "$largeur m",
                    "depth": "$longueur m",
                    "height": "$hauteur m",
                    "under_ceiling_height": "$hauteur_plafond m sous plafond"
                },
                "levels": {
                    "ground_level": "TN (Terrain Naturel)",
                    "finished_floor": "NFP = TN + $hauteur_plancher m"
                }
            },
            "annotations": {
                "labels": {
                    "tn": "TN - Terrain Naturel",
                    "nfp": "NFP - Niveau Finie Plancher",
                    "section_line": "COUPE AA"
                },
                "dimensions": [
                    "Largeur: $largeur m",
                    "Hauteur: $hauteur m",
                    "Profondeur fondation: $profondeur_fondation m",
                    "Pente toiture: $pente %"
                ],
                "scale": {
                    "label": "Échelle : 1/50",
                    "location": "Bottom center"
                }
            },
            "title_blocks": {
                "header_title": {
                    "text": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN EN COUPE (DP3)"
                },
                "bottom_block": {
                    "cell1": "DOSSIER DE DÉCLARATION PRÉALABLE - PLAN EN COUPE (DP3)",
                    "cell2": "Échelle : 1/50",
                    "cell3": "$project_label - Vue en coupe technique"
                }
            }
        },
        "abri_jardin": {
            "project_label": "Abri de jardin",
            "description": "Coupe de l'abri de jardin $longueur m x $largeur m",
            "specific_elements": {
                "structure": "Ossature bois/métal sur dalle béton",
                "walls": "Panneaux $materiau_facade",
                "roof": "Toiture $materiau_toiture $couleur_toiture"
            }
        },
        "piscine": {
            "project_label": "Piscine",
            "description": "Coupe longitudinale de la piscine $longueur m x $largeur m",
            "specific_elements": {
                "bassins": "Coupe du bassin, liner $couleur_liner",
                "profondeur": "Profondeur: $profondeur m",
                "structure": "Coffrage périphérique, dalle de fond",
                "securite": "Barrière de sécurité visible"
            }
        },
        "garage": {
            "project_label": "Garage",
            "description": "Coupe du garage $longueur m x $largeur m",
            "specific_elements": {
                "structure": "Murs $materiau_facade, dalle béton",
                "portail": "Portail $type_portail"
            }
        },
        "terrasse": {
            "project_label": "Terrasse",
            "description": "Coupe de la terrasse $longueur m x $largeur m",
            "specific_elements": {
                "structure": "Structure $type_terrasse sur plots ou dalle",
                "hauteur": "Hauteur: $hauteur m du sol"
            }
        }
    },

    "dp4": {
        "default": {
            "project_type": "Architectural Plan - Façades (DP4)",
            "document_title": {
                "text": "DOSSIER DE DÉCLARATION PRÉALABLE - FAÇADES (DP4)",
                "font_style": "Clear, technical sans-serif font"
            },
            "overall_scene": {
                "format": "Architectural elevation drawings (Façades)",
                "perspective": "2D orthographic elevation views (front, sides, rear)",
                "background": "Clean white document background, with a prominent border",
                "rendering_style": "Professional architectural elevation, clean lines, realistic material textures"
            },
            "elevations": {
                "front": {
                    "label": "Façade principale (rue)",
                    "elements": [
                        "$nb_porte porte(s) avec menuiseries aluminium",
                        "$nb_fenetre fenêtre(s) à double vitrage",
                        "$nb_porte_garage porte(s) de garage sectionnelle"
                    ],
                    "materials": {
                        "wall": "Enduit taloché $materiau_facade",
                        "color": "$couleur_facade (RAL $couleur_facade)",
                        "trim": "Encadrement et modénatures: $couleur_encadrement"
                    }
                },
                "side_left": {
                    "label": "Façade latérale gauche",
                    "details": "Pignons et descentes d'eaux pluviales zinc"
                },
                "side_right": {
                    "label": "Façade latérale droite",
                    "details": "Pignons et menuiseries"
                },
                "rear": {
                    "label": "Façade arrière",
                    "details": "Ouvertures sur jardin"
                }
            },
            "roof": {
                "type": "$type_toiture",
                "material": "$materiau_toiture (Tuiles terres cuites ou Ardoises)",
                "color": "$couleur_toiture",
                "slope": "Pente: $pente %",
                "details": "Rives et faîtages assortis"
            },
            "openings": {
                "doors": "$nb_porte",
                "windows": "$nb_fenetre",
                "garage_doors": "$nb_porte_garage"
            },
            "annotations": {
                "labels": {
                    "facade_principale": "Façade principale",
                    "facade_arriere": "Façade arrière",
                    "facade_gauche": "Façade latérale gauche",
                    "facade_droite": "Façade latérale droite"
                },
                "north_indicator": "Nord: $nord",
                "scale": {
                    "label": "Échelle : 1/100",
                    "location": "Bottom center"
                }
            },
            "title_blocks": {
                "header_title": {
                    "text": "DOSSIER DE DÉCLARATION PRÉALABLE - FAÇADES (DP4)"
                },
                "bottom_block": {
                    "cell1": "DOSSIER DE DÉCLARATION PRÉALABLE - FAÇADES (DP4)",
                    "cell2": "Échelle : 1/100",
                    "cell3": "$project_label - Élévations techniques"
                }
            }
        },
        "abri_jardin": {
            "project_label": "Abri de jardin",
            "description": "Façades de l'abri de jardin $longueur m x $largeur m avec bardage bois",
            "specific_elements": {
                "style": "Façades en $materiau_facade",
                "porte": "Porte simple $type_porte",
                "nb_fenetre": "$nb_fenetre fenêtre(s) haute"
            }
        },
        "piscine": {
            "project_label": "Piscine",
            "description": "Local technique et clôture de la piscine style moderne",
            "specific_elements": {
                "local_technique": "Local technique: $dimension_local en harmonie avec l'existant",
                "cloture": "Clôture $type_cloture avec occultation"
            }
        },
        "garage": {
            "project_label": "Garage",
            "description": "Façades du garage $longueur m x $largeur m, style pavillonnaire",
            "specific_elements": {
                "nb_porte_garage": "$nb_porte_garage porte(s) de garage motorisée",
                "porte": "Porte de service: $nb_porte",
                "fenetre": "$nb_fenetre fenêtre(s) de type soupirail"
            }
        },
        "terrasse": {
            "project_label": "Terrasse",
            "description": "Façades de la terrasse $type_terrasse avec garde-corps vitré"
        }
    },

    "dp5": {
        "default": {
            "project_type": "Architectural Visualization - Représentation Extérieure (DP5)",
            "document_title": {
                "text": "DOSSIER DE DÉCLARATION PRÉALABLE - REPRÉSENTATION EXTÉRIEURE (DP5)",
                "font_style": "Clear, technical sans-serif font"
            },
            "overall_scene": {
                "format": "External view / Perspective du projet",
                "perspective": "3D perspective or 2D front view from main public space",
                "background": "Realistic contextual environment with existing buildings, vegetation, and street",
                "rendering_style": "Professional architectural visualization, photorealistic lighting and textures"
            },
            "project_view": {
                "structure": {
                    "label": "$project_label (Projet)",
                    "dimensions": "$largeur m x $longueur m",
                    "surface": "$surface m²",
                    "height": "$hauteur m"
                },
                "materials": {
                    "walls": "Enduit $materiau_facade couleur $couleur_facade",
                    "color": "$couleur_facade",
                    "roof": "$materiau_toiture",
                    "roof_color": "$couleur_toiture"
                }
            },
            "context": {
                "street_view": "Vue depuis la rue principale (Espace public)",
                "neighboring_buildings": "Bâtiments mitoyens et environnement immédiat",
                "public_way": "Voie publique et trottoirs avec mobilier urbain subtil"
            },
            "annotations": {
                "labels": {
                    "projet": "$project_label (PROJET)",
                    "rue": "Espace Public / Rue",
                    "maison_existante": "Maison existante"
                },
                "scale": {
                    "label": "Document non à l'échelle pour la perspective"
                }
            },
            "title_blocks": {
                "header_title": {
                    "text": "DOSSIER DE DÉCLARATION PRÉALABLE - REPRÉSENTATION EXTÉRIEURE (DP5)"
                },
                "bottom_block": {
                    "cell1": "DOSSIER DE DÉCLARATION PRÉALABLE - REPRÉSENTATION EXTÉRIEURE (DP5)",
                    "cell2": "Perspective architecturale",
                    "cell3": "$project_label - Insertion volumétrique"
                }
            }
        },
        "abri_jardin": {
            "project_label": "Abri de jardin",
            "description": "Vue extérieure de l'abri de jardin intégré en fond de parcelle"
        },
        "piscine": {
            "project_label": "Piscine",
            "description": "Perspective de la piscine avec plage aménagée et mobilier de jardin"
        },
        "garage": {
            "project_label": "Garage",
            "description": "Vue extérieure du garage depuis la voie d'accès latérale"
        },
        "terrasse": {
            "project_label": "Terrasse",
            "description": "Vue de la terrasse en extension du séjour"
        }
    },

    "dp6": {
        "default": {
            "project_type": "Architectural Visualization - Insertion Paysagère (DP6)",
            "document_title": {
                "text": "DOSSIER DE DÉCLARATION PRÉALABLE - INSERTION PAYSAGÈRE (DP6)",
                "font_style": "Clear, technical sans-serif font"
            },
            "overall_scene": {
                "format": "Photomontage / Simulation visuelle d'insertion paysagère",
                "perspective": "Vue perspective depuis point de vue public le plus éloigné (DP6.1 et DP6.2)",
                "background": "Photo réelle du site existant fusionnée avec le modèle 3D du projet",
                "rendering_style": "Realistic photomontage, professional color matching, high-end integration"
            },
            "project_insertion": {
                "structure": {
                    "label": "$project_label",
                    "dimensions": "$largeur m x $longueur m",
                    "surface": "$surface m²"
                },
                "materials": {
                    "walls": "Enduit $materiau_facade $couleur_facade",
                    "color": "$couleur_facade",
                    "roof": "$materiau_toiture"
                }
            },
            "landscaping": {
                "existing_vegetation": "Conservation de la trame paysagère existante",
                "new_planting": "Renforcement végétal avec essences locales",
                "trees": "$nb_arbres arbre(s) à hautes tiges à planter"
            },
            "context": {
                "viewpoint": "Vue depuis $point_vue (espace public lointain)",
                "existing_landscape": "Intégration harmonieuse dans le paysage urbain et végétal"
            },
            "annotations": {
                "labels": {
                    "projet": "$project_label",
                    "vegetation_existante": "Trame paysagère conservée",
                    "nouvelles_plantes": "Aménagements paysagers projetés"
                },
                "scale": {
                    "label": "Simulation visuelle réaliste"
                }
            },
            "title_blocks": {
                "header_title": {
                    "text": "DOSSIER DE DÉCLARATION PRÉALABLE - INSERTION PAYSAGÈRE (DP6)"
                },
                "bottom_block": {
                    "cell1": "DOSSIER DE DÉCLARATION PRÉALABLE - INSERTION PAYSAGÈRE (DP6)",
                    "cell2": "Simulation visuelle réaliste",
                    "cell3": "Insertion paysagère - Avant/Après"
                }
            }
        },
        "abri_jardin": {
            "project_label": "Abri de jardin",
            "description": "Insertion paysagère de l'abri de jardin dans le jardin"
        },
        "piscine": {
            "project_label": "Piscine",
            "description": "Insertion paysagère de la piscine avec plantations"
        },
        "garage": {
            "project_label": "Garage",
            "description": "Insertion paysagère du garage dans la cour"
        },
        "terrasse": {
            "project_label": "Terrasse",
            "description": "Insertion paysagère de la terrasse avec végétation"
        }
    }
}


VARIABLES_MAPPING = {
    "longueur": "longueur",
    "largeur": "largeur",
    "hauteur": "hauteurConstruction",
    "surface": "surfaceCreee",
    "emprise": "empriseSolCreee",
    "surface_verte": "surfaceVerte",
    "surface_bassin": "surfaceBassin",
    "profondeur": "profondeurMoyenne",
    "profondeur_fondation": "profondeurFondation",
    "hauteur_plafond": "hauteurPlancher",
    "hauteur_plancher": "hauteurPlancher",
    "epaisseur_mur": "epaisseurMur",
    "position_maison": "positionMaisonExistante",
    "position_structure": "positionNouveau Projet",
    "distance_maison": "distanceMaison",
    "nb_stationnement": "stationnementCree",
    "nb_vehicules": "nbVehicules",
    "nb_niveaux": "nombreNiveaux",
    "nb_porte": "nbPorte",
    "nb_fenetre": "nbFenetre",
    "nb_porte_garage": "nbPorteGarage",
    "nb_arbres": "nbArbres",
    "materiau_facade": "materiauFacade",
    "couleur_facade": "couleurFacade",
    "materiau_toiture": "materiauToiture",
    "couleur_toiture": "couleurToiture",
    "couleur_encadrement": "couleurEncadrement",
    "couleur_liner": "couleurLiner",
    "type_toiture": "typeToiture",
    "pente": "penteToiture",
    "type_garage": "typeGarage",
    "type_terrasse": "typeTerrasse",
    "type_cloture": "typeCloture",
    "type_portail": "typePortail",
    "type_vitrage": "typeVitrage",
    "type_plancher": "typePlancher",
    "type_porte": "typePorte",
    "usageabri": "usageabri",
    "dispositif_securite": "dispositifSecurite",
    "point_vue": "pointVue",
    "nord": "nord",
    "dimension_local": "dimensionLocalTechnique"
}


def normalize_data(data):
    """
    Normalise les clés des données utilisateur pour gérer les variations d'orthographe
    et assurer la compatibilité avec le système de templates.
    """
    if not isinstance(data, dict):
        return data
        
    normalized = data.copy()
    
    # Mapping des synonymes / erreurs courantes vers les clés canoniques
    synonyms = {
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
        "nb_porte": "nbPorte",
        "nb_portes": "nbPorte",
        "nb_fenetre": "nbFenetre",
        "nb_fenetres": "nbFenetre",
        "nb_arbres": "nbArbres",
        "nb_arbre": "nbArbres",
        "materiau": "materiauFacade",
        "matériau": "materiauFacade",
        "couleur": "couleurFacade"
    }
    
    for syn, canonical in synonyms.items():
        if syn in data and (canonical not in data or data[canonical] in [None, ""]):
            normalized[canonical] = data[syn]
            
    # Déduction automatique du type de projet par mots-clés dans la description ou natureTravaux
    return normalized


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
    "transformation_garage": "transformation_garage"
}


def get_project_type(data):
    """
    Extrait le type de projet à partir des données utilisateur.
    Cherche dans natureTravaux d'abord, puis dans la description.
    """
    nature_travaux = data.get('natureTravaux', [])
    nature = ""
    
    if isinstance(nature_travaux, list) and nature_travaux:
        nature = nature_travaux[0].lower().strip()
    elif isinstance(nature_travaux, str):
        nature = nature_travaux.lower().strip()
    
    # Si non trouvé dans natureTravaux, chercher par mots-clés dans la description
    if not nature or nature == "default" or nature not in PROJECT_TYPE_MAPPING:
        description = str(data.get('descriptionProjet', '')).lower()
        for key, value in PROJECT_TYPE_MAPPING.items():
            if key.replace('_', ' ') in description or key in description:
                return value
                
    return PROJECT_TYPE_MAPPING.get(nature, "default")


def get_dp_template(dp_type, project_type):
    """
    Retourne le template approprié pour le DP et le type de projet
    """
    if dp_type not in DP_TEMPLATES:
        raise ValueError(f"Type de DP non supporté: {dp_type}")
    
    dp_templates = DP_TEMPLATES[dp_type]
    
    if project_type in dp_templates:
        template = dp_templates["default"].copy()
        template.update(dp_templates[project_type])
        return template
    
    return dp_templates["default"]


def substitute_variables(template_dict, data):
    """
    Substitue les variables $variable dans le template avec les valeurs des données utilisateur
    """
    result = {}
    
    for key, value in template_dict.items():
        if isinstance(value, dict):
            result[key] = substitute_variables(value, data)
        elif isinstance(value, list):
            result[key] = [
                substitute_variables(item, data) if isinstance(item, dict) 
                else substitute_in_string(item, data)
                for item in value
            ]
        elif isinstance(value, str):
            result[key] = substitute_in_string(value, data)
        else:
            result[key] = value
    
    return result


def substitute_in_string(text, data):
    """
    Substitue les variables $xxx dans une chaîne de caractères
    """
    if not isinstance(text, str):
        return text
    
    result = text
    
    # Remplacements prioritaires basés sur les clés normalisées
    result = result.replace("$surface m²", f"{data.get('surfaceCreee', '?')} m²")
    result = result.replace("$surface", str(data.get('surfaceCreee', '?')))
    result = result.replace("$largeur m", f"{data.get('largeur', '?')} m")
    result = result.replace("$largeur", str(data.get('largeur', '?')))
    result = result.replace("$longueur m", f"{data.get('longueur', '?')} m")
    result = result.replace("$longueur", str(data.get('longueur', '?')))
    result = result.replace("$hauteur m", f"{data.get('hauteurConstruction', '?')} m")
    result = result.replace("$hauteur", str(data.get('hauteurConstruction', '?')))
    
    # Autres variables du dictionnaire de mapping
    for var_name, data_key in VARIABLES_MAPPING.items():
        placeholder = f"${var_name}"
        if placeholder in result:
            value = data.get(data_key, "")
            if value is None or value == "":
                # Fallback sur la clé var_name elle-même si présente (après normalisation)
                value = data.get(var_name, "?")
            result = result.replace(placeholder, str(value))
    
    result = result.replace("$project_label", data.get("project_label", "Projet"))
    result = result.replace("$project_type_display", data.get("project_type_display", "Construction"))
    
    return result


def build_prompt_from_template(dp_type, data):
    """
    Construit le prompt final pour la génération d'image
    """
    project_type = get_project_type(data)
    template = get_dp_template(dp_type, project_type)
    
    data["project_label"] = template.get("project_label", "Projet")
    data["project_type_display"] = template.get("project_type_display", "Construction")
    
    prompt_data = substitute_variables(template, data)
    
    import json
    prompt_json = json.dumps(prompt_data, indent=2, ensure_ascii=False)
    
    final_prompt = f"Génère une image d'architecture professionnelle basée sur cette description détaillée : {prompt_json}. Style : Plan technique, haute précision, rendu 4K."
    
    return final_prompt
