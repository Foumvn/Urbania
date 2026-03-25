/**
 * Mapping complet des champs du formulaire Cerfa 16702-02
 * Déclaration préalable - Constructions et travaux non soumis à permis de construire
 * 
 * Structure par cadre/section du formulaire officiel
 */

export const CERFA_CADRES = {
    CADRE_1: {
        label: 'Cadre réservé à la mairie',
        fields: [],
        description: 'Dossier n°, cachet, date de dépôt'
    },

    CADRE_2: {
        label: 'Identité du déclarant',
        fields: [],
        description: 'Particulier ou personne morale'
    },

    CADRE_3: {
        label: 'Le terrain',
        fields: ['terrainAdresse', 'terrainCodePostal', 'terrainVille', 'terrainLieuDit', 'prefixe', 'section', 'numeroParcelle', 'surfaceTerrain', 'surfaceTotale'],
        description: 'Localisation et références cadastrales'
    },

    CADRE_4: {
        label: 'Projet de construction',
        subSections: {
            '4.1': 'Nature des travaux',
            '4.2': 'Informations complémentaires',
            '4.3': 'Emprise au sol',
            '4.4': 'Destination et surfaces',
            '4.5': 'Stationnement'
        }
    },

    CADRE_5: {
        label: 'Informations législations connexes',
        fields: ['iota', 'autorisationEnv', 'derogationEspeces', 'enregistrement', 'avisABF', 'autreLegislations'],
        description: 'Loi sur l\'eau, espèces protégées, monuments historiques...'
    },

    CADRE_6: {
        label: 'Participation voirie et réseaux (PVR)',
        fields: ['pvrProprietaire', 'pvrAdresse'],
        description: 'Coordonnées du propriétaire ou bénéficiaire'
    },

    CADRE_7: {
        label: 'Engagement du déclarant',
        fields: ['engagementExactitude', 'engagementReglementation', 'dateDeclaration', 'lieuDeclaration', 'signature'],
        description: 'Signature et date'
    }
};

export const DESTINATIONS_CERFA = [
    {
        value: 'exploitation_agricole',
        label: 'Exploitation agricole',
        sousDestinations: ['Exploitation agricole', 'Exploitation forestière']
    },
    {
        value: 'habitation',
        label: 'Habitation',
        sousDestinations: ['Logement', 'Hébergement']
    },
    {
        value: 'commerce_activite',
        label: 'Commerce et activités de service',
        sousDestinations: [
            'Artisanat et commerce de détail',
            'Restauration',
            'Commerce de gros',
            'Activités de services où s\'effectue l\'accueil d\'une clientèle',
            'Cinéma',
            'Hôtels',
            'Autres hébergements touristiques'
        ]
    },
    {
        value: 'equipement_collectif',
        label: 'Équipement d\'intérêt collectif et services publics',
        sousDestinations: [
            'Locaux et bureaux accueillant du public des administrations publiques et assimilés',
            'Locaux techniques et industriels des administrations publiques et assimilés',
            'Établissements d\'seignement, de santé et d\'action sociale',
            'Salles d\'art et de spectacles',
            'Équipements sportifs',
            'Lieux de culte',
            'Autres équipements recevant du public'
        ]
    },
    {
        value: 'industrie',
        label: 'Industrie',
        sousDestinations: ['Industrie']
    },
    {
        value: 'exploitation',
        label: 'Exploitation',
        sousDestinations: ['Exploitation agricole', 'Exploitation forestière']
    },
    {
        value: 'entrepot',
        label: 'Entrepôt',
        sousDestinations: ['Entrepôt', 'Bureau']
    },
    {
        value: 'autre',
        label: 'Autres activités',
        sousDestinations: ['Centre de congrès et d\'exposition', 'Cuisine dédiée à la vente en ligne']
    }
];

export const CHAMPS_CERFA = {
    // ============================================
    // CADRE 3 - TERRAIN
    // ============================================
    terrain: {
        numero: { label: 'Numéro', type: 'text', cerfaRef: '3.1 - Adresse' },
        adresse: { label: 'Voie', type: 'text', cerfaRef: '3.1 - Adresse' },
        lieuDit: { label: 'Lieu-dit', type: 'text', cerfaRef: '3.1 - Adresse' },
        codePostal: { label: 'Code postal', type: 'text', cerfaRef: '3.1 - Adresse' },
        ville: { label: 'Localité', type: 'text', cerfaRef: '3.1 - Adresse' },

        // Cadastre 3.1
        prefixe: { label: 'Préfixe', type: 'text', cerfaRef: '3.1 - Références cadastrales' },
        section: { label: 'Section', type: 'text', cerfaRef: '3.1 - Références cadastrales' },
        numeroParcelle: { label: 'Numéro parcelle', type: 'text', cerfaRef: '3.1 - Références cadastrales' },
        surfaceParcelle: { label: 'Superficie parcelle (m²)', type: 'number', cerfaRef: '3.1 - Références cadastrales' },

        // 3.2 Situation juridique
        certificatUrbanisme: { label: 'Certificat d\'urbanisme', type: 'select', options: ['Oui', 'Non', 'Je ne sais pas'], cerfaRef: '3.2' },
        lotissement: { label: 'Terrain situé dans un lotissement ?', type: 'select', options: ['Oui', 'Non', 'Je ne sais pas'], cerfaRef: '3.2' },
        zoneZAC: { label: 'Zone d\'Aménagement Concertée (Z.A.C.) ?', type: 'select', options: ['Oui', 'Non', 'Je ne sais pas'], cerfaRef: '3.2' },
        remembrement: { label: 'Remembrement urbain ?', type: 'select', options: ['Oui', 'Non', 'Je ne sais pas'], cerfaRef: '3.2' },
        perimetrePUP: { label: 'Périmètre P.U.P. ?', type: 'select', options: ['Oui', 'Non', 'Je ne sais pas'], cerfaRef: '3.2' },
    },

    // ============================================
    // CADRE 4.1 - NATURE DES TRAVAUX
    // ============================================
    natureTravaux: {
        nouvelleConstruction: { label: 'Nouvelle construction', type: 'boolean', cerfaRef: '4.1' },
        travauxChangementDestination: { label: 'Travaux ou changement de destination', type: 'boolean', cerfaRef: '4.1' },
        cloture: { label: 'Clôture', type: 'boolean', cerfaRef: '4.1' },
        descriptionTravaux: { label: 'Courte description du projet', type: 'textarea', cerfaRef: '4.1' },
    },

    // ============================================
    // CADRE 4.2 - INFORMATIONS COMPLÉMENTAIRES
    // ============================================
    informationsComplementaires: {
        // Type de travaux
        typeTravaux: {
            label: 'Type de travaux',
            type: 'select',
            options: ['Piscine', 'Garage', 'Véranda', 'Abri de jardin', 'Surélévation', 'Extension', 'Transformation garage', 'Autres annexes'],
            cerfaRef: '4.2'
        },

        // Nombre de logements
        nombreLogements: { label: 'Nombre total de logements créés', type: 'number', cerfaRef: '4.2' },
        nombreLogementsIndividuels: { label: 'Dont individuels', type: 'number', cerfaRef: '4.2' },
        nombreLogementsCollectifs: { label: 'Dont collectifs', type: 'number', cerfaRef: '4.2' },

        // Mode d'utilisation
        modeUtilisation: {
            label: 'Mode d\'utilisation principale',
            type: 'select',
            options: ['Occupation personnelle', 'Vente', 'Location'],
            cerfaRef: '4.2'
        },

        // Type de résidence
        typeResidence: {
            label: 'Type de résidence',
            type: 'select',
            options: ['Résidence principale', 'Résidence secondaire'],
            cerfaRef: '4.2'
        },

        // Répartition par financement
        logementLocatifSocial: { label: 'Logement Locatif Social', type: 'number', cerfaRef: '4.2' },
        accessionSociale: { label: 'Accession Sociale', type: 'number', cerfaRef: '4.2' },
        preTauxZero: { label: 'Prêt à taux zéro', type: 'number', cerfaRef: '4.2' },
        autresFinancements: { label: 'Autres financements', type: 'number', cerfaRef: '4.2' },

        // Résidences spécifiques
        residencePersonnesAgees: { label: 'Résidence pour personnes âgées', type: 'number', cerfaRef: '4.2' },
        residenceEtudiants: { label: 'Résidence pour étudiants', type: 'number', cerfaRef: '4.2' },
        residenceHoteliere: { label: 'Résidence hôtelière', type: 'number', cerfaRef: '4.2' },
        residenceSociale: { label: 'Résidence sociale', type: 'number', cerfaRef: '4.2' },
        residenceHandicapés: { label: 'Résidence pour personnes handicapées', type: 'number', cerfaRef: '4.2' },
        autresResidences: { label: 'Autres résidences', type: 'number', cerfaRef: '4.2' },

        // Nombre de pièces
        nombrePieces1: { label: '1 pièce', type: 'number', cerfaRef: '4.2' },
        nombrePieces2: { label: '2 pièces', type: 'number', cerfaRef: '4.2' },
        nombrePieces3: { label: '3 pièces', type: 'number', cerfaRef: '4.2' },
        nombrePieces4: { label: '4 pièces', type: 'number', cerfaRef: '4.2' },
        nombrePieces5: { label: '5 pièces', type: 'number', cerfaRef: '4.2' },
        nombrePieces6Plus: { label: '6 pièces et plus', type: 'number', cerfaRef: '4.2' },

        // Niveaux
        nombreNiveauxDessus: { label: 'Nombre de niveaux au-dessus du sol', type: 'number', cerfaRef: '4.2' },
        nombreNiveauxDessous: { label: 'Nombre de niveaux au-dessous du sol', type: 'number', cerfaRef: '4.2' },

        // Destination service public
        destinationServicePublic: {
            label: 'Destination pour service public',
            type: 'select',
            options: ['Transport', 'Enseignement et recherche', 'Action sociale', 'Ouvrages spécial', 'Santé', 'Culture et loisir', 'Aucun'],
            cerfaRef: '4.2'
        },

        // Panneau chantier
        affichePanneauChantier: { label: 'Affichage panneau chantier prévu', type: 'boolean', cerfaRef: '4.2' },
    },

    // ============================================
    // CADRE 4.2.1 - SOLAIRE PHOTOVOLTAÏQUE
    // ============================================
    solaire: {
        puissanceCrete: { label: 'Puissance crête (kW)', type: 'number', cerfaRef: '4.2.1' },
        destinationEnergie: { label: 'Destination principale de l\'énergie', type: 'text', cerfaRef: '4.2.1' },
        puissanceElectrique: { label: 'Puissance électrique nécessaire (kVA)', type: 'number', cerfaRef: '4.2.1' },
        installationAgrivoltaïque: { label: 'Installation agrivoltaïque', type: 'boolean', cerfaRef: '4.2.1' },
    },

    // ============================================
    // CADRE 4.2.2 - RECUL CÔTE
    // ============================================
    reculCote: {
        modeConstructif: { label: 'Mode constructif', type: 'select', options: ['Modulaire', 'Maçonnerie', 'Métal', 'Bois'], cerfaRef: '4.2.2' },
        typeFondations: { label: 'Type de fondations', type: 'select', options: ['Fondations classiques', 'Fondations profondes'], cerfaRef: '4.2.2' },
        niveauxEnterres: { label: 'Niveaux enterrés (sous-sol)', type: 'number', cerfaRef: '4.2.2' },
    },

    // ============================================
    // CADRE 4.3 - EMPRISE AU SOL
    // ============================================
    empriseSol: {
        existante: { label: 'Emprise au sol avant travaux (m²)', type: 'number', cerfaRef: '4.3' },
        creee: { label: 'Emprise au sol créée (m²)', type: 'number', cerfaRef: '4.3' },
        supprimee: { label: 'Emprise au sol supprimée (m²)', type: 'number', cerfaRef: '4.3' },
        totale: { label: 'Emprise au sol totale après travaux (m²)', type: 'number', readonly: true, cerfaRef: '4.3' },
    },

    // ============================================
    // CADRE 4.4 - DESTINATION ET SURFACES
    // ============================================
    surfaces: {
        // Pour chaque destination : existantes, créées, supprimées, changement destination
        // Habitation
        habitationExistante: { label: 'Habitation - Existante', type: 'number', cerfaRef: '4.4' },
        habitationCreee: { label: 'Habitation - Créée', type: 'number', cerfaRef: '4.4' },
        habitationSupprimee: { label: 'Habitation - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Hébergement
        hebergementExistante: { label: 'Hébergement - Existante', type: 'number', cerfaRef: '4.4' },
        hebergementCreee: { label: 'Hébergement - Créée', type: 'number', cerfaRef: '4.4' },
        hebergementSupprimee: { label: 'Hébergement - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Commerce et activités de service
        commerceExistante: { label: 'Commerce - Existante', type: 'number', cerfaRef: '4.4' },
        commerceCreee: { label: 'Commerce - Créée', type: 'number', cerfaRef: '4.4' },
        commerceSupprimee: { label: 'Commerce - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Équipement d'intérêt collectif
        equipementExistante: { label: 'Équipement collectif - Existante', type: 'number', cerfaRef: '4.4' },
        equipementCreee: { label: 'Équipement collectif - Créée', type: 'number', cerfaRef: '4.4' },
        equipementSupprimee: { label: 'Équipement collectif - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Industrie
        industrieExistante: { label: 'Industrie - Existante', type: 'number', cerfaRef: '4.4' },
        industrieCreee: { label: 'Industrie - Créée', type: 'number', cerfaRef: '4.4' },
        industrieSupprimee: { label: 'Industrie - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Exploitation agricole
        exploitationExistante: { label: 'Exploitation agricole - Existante', type: 'number', cerfaRef: '4.4' },
        exploitationCreee: { label: 'Exploitation agricole - Créée', type: 'number', cerfaRef: '4.4' },
        exploitationSupprimee: { label: 'Exploitation agricole - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Entrepôt
        entrepotExistante: { label: 'Entrepôt - Existante', type: 'number', cerfaRef: '4.4' },
        entrepotCreee: { label: 'Entrepôt - Créée', type: 'number', cerfaRef: '4.4' },
        entrepotSupprimee: { label: 'Entrepôt - Supprimée', type: 'number', cerfaRef: '4.4' },

        // Surface totale
        surfacePlancherExistante: { label: 'Surface de plancher existante (m²)', type: 'number', cerfaRef: '4.4' },
        surfacePlancherCreee: { label: 'Surface de plancher créée (m²)', type: 'number', cerfaRef: '4.4' },
        surfacePlancherSupprimee: { label: 'Surface de plancher supprimée (m²)', type: 'number', cerfaRef: '4.4' },
        surfacePlancherTotale: { label: 'Surface de plancher totale (m²)', type: 'number', readonly: true, cerfaRef: '4.4' },
    },

    // ============================================
    // CADRE 4.5 - STATIONNEMENT
    // ============================================
    stationnement: {
        placesAvant: { label: 'Nombre de places avant projet', type: 'number', cerfaRef: '4.5' },
        placesApres: { label: 'Nombre de places après projet', type: 'number', cerfaRef: '4.5' },

        // Places en dehors du terrain
        placesExterieures: { label: 'Places de stationnement affectées au projet en dehors du terrain', type: 'boolean', cerfaRef: '4.5' },
        adresseStationnement1: { label: 'Adresse stationnement 1', type: 'text', cerfaRef: '4.5' },
        adresseStationnement2: { label: 'Adresse stationnement 2', type: 'text', cerfaRef: '4.5' },

        // Pour commerce/cinéma
        empriseSolStationnement: { label: 'Emprise au sol des surfaces de stationnement (m²)', type: 'number', cerfaRef: '4.5' },
    },

    // ============================================
    // CADRE 5 - LÉGISLATIONS CONNEXES
    // ============================================
    legislationsConnexes: {
        // Loi sur l'eau
        iota: {
            label: 'Installation, ouvrage, travaux ou activité (IOTA) soumis à déclaration Loi sur l\'eau',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Autorisation environnementale
        autorisationEnv: {
            label: 'Travaux soumis à autorisation environnementale',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Dérogation espèces protégées
        derogationEspeces: {
            label: 'Dérogation au titre du L.411-2 4° (espèces protégées)',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Enregistrement ICPE
        enregistrement: {
            label: 'Installation classée soumise à enregistrement',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Avis ABF
        avisABF: {
            label: 'Relevé de l\'article L.632-2-1 du code du patrimoine (avis ABF)',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Autre législation
        autreLegislations: {
            label: 'Demande d\'autorisation au titre d\'une autre législation',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },
        precisezAutreLegislations: { label: 'Précisez laquelle', type: 'text', cerfaRef: '5' },

        // Raccordement réseau chaleur
        raccordementChaleur: {
            label: 'Obligation de raccordement à un réseau de chaleur et de froid',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Article L.171-4
        articleL1714: {
            label: 'Relevé du II de l\'article L.171-4 du code de la construction',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Allée d'arbres
        alleeArbres: {
            label: 'Atteinte à une allée d\'arbres ou alignement',
            type: 'select',
            options: ['Oui', 'Non'],
            cerfaRef: '5'
        },

        // Périmètres de protection
        sitePatrimonialRemarquable: { label: 'Périmètre site patrimonial remarquable', type: 'boolean', cerfaRef: '5' },
        abordsMonumentHistorique: { label: 'Abords d\'un monument historique', type: 'boolean', cerfaRef: '5' },
        siteClasse: { label: 'Site classé ou en instance de classement', type: 'boolean', cerfaRef: '5' },
    },

    // ============================================
    // CADRE 6 - PVR
    // ============================================
    pvr: {
        particulier: { label: 'Particulier PVR', type: 'boolean', cerfaRef: '6' },
        personneMorale: { label: 'Personne morale PVR', type: 'boolean', cerfaRef: '6' },

        // Propriétaire
        pvrNom: { label: 'Nom', type: 'text', cerfaRef: '6' },
        pvrPrenom: { label: 'Prénom', type: 'text', cerfaRef: '6' },
        pvrDenomination: { label: 'Dénomination', type: 'text', cerfaRef: '6' },
        pvrRaisonSociale: { label: 'Raison sociale', type: 'text', cerfaRef: '6' },
        pvrSiret: { label: 'N° SIRET', type: 'text', cerfaRef: '6' },
        pvrTypeSociete: { label: 'Type de société', type: 'text', cerfaRef: '6' },

        // Adresse
        pvrAdresseNumero: { label: 'Numéro', type: 'text', cerfaRef: '6' },
        pvrAdresseVoie: { label: 'Voie', type: 'text', cerfaRef: '6' },
        pvrAdresseLieuDit: { label: 'Lieu-dit', type: 'text', cerfaRef: '6' },
        pvrAdresseCodePostal: { label: 'Code postal', type: 'text', cerfaRef: '6' },
        pvrAdresseVille: { label: 'Localité', type: 'text', cerfaRef: '6' },
        pvrAdresseBP: { label: 'BP', type: 'text', cerfaRef: '6' },
        pvrAdresseCedex: { label: 'Cedex', type: 'text', cerfaRef: '6' },
        pvrAdressePays: { label: 'Pays', type: 'text', cerfaRef: '6' },
        pvrEmail: { label: 'Email', type: 'email', cerfaRef: '6' },
    },

    // ============================================
    // ASPECT EXTÉRIEUR (paraît dans plusieurs sections)
    // ============================================
    aspectExterieur: {
        couleurFacade: { label: 'Couleur des façades', type: 'select', options: ['Blanc', 'Blanc cassé', 'Beige', 'Gris clair', 'Gris foncé', 'Noir', 'Bleu', 'Vert', 'Marron', 'Rouge', 'Terracotta', 'Autre'] },
        materiauFacade: { label: 'Matériau des façades', type: 'select', options: ['Enduit', 'Crépi', 'Bardage bois', 'Bardage composite', 'Pierre', 'Brique', 'Parpaing', 'Béton', 'Verre', 'Métal', 'Autre'] },
        couleurToiture: { label: 'Couleur de la toiture', type: 'select', options: ['Blanc', 'Gris', 'Noir', 'Rouge', 'Marron', 'Vert', 'Bleu', 'Terracotta', 'Autre'] },
        materiauToiture: { label: 'Matériau de la toiture', type: 'select', options: ['Tuiles', 'Ardoises', 'Zinc', 'Bac acier', 'Toit terrasse', 'Membrane PVC', 'Chaume', 'Bois', 'Shingle', 'Autre'] },
        hauteurConstruction: { label: 'Hauteur de la construction (m)', type: 'number' },
    },

    // ============================================
    // PISCINE / BASSIN
    // ============================================
    piscine: {
        surfaceBassin: { label: 'Surface du bassin (m²)', type: 'number' },
        profondeurMoyenne: { label: 'Profondeur moyenne (m)', type: 'number' },
        dispositifSecurite: { label: 'Dispositif de sécurité', type: 'select', options: ['Alarme', 'Barrière', 'Couverture', 'Abri', 'Aucun'] },
        piscineCouverte: { label: 'Piscine couverte', type: 'boolean' },
    },

    // ============================================
    // CLÔTURE
    // ============================================
    cloture: {
        hauteurMax: { label: 'Hauteur maximale (m)', type: 'number' },
        materiau: { label: 'Matériau', type: 'select', options: ['Mur', 'Grillage', 'Bois', 'PVC', 'Métal', 'Pierre', 'Mixte'] },
        lineaireTotal: { label: 'Linéaire total (m)', type: 'number' },
        includePortail: { label: 'Inclut un portail', type: 'boolean' },
        typePortail: { label: 'Type de portail', type: 'select', options: ['Battant', 'Coulissant', 'Mixte'] },
    },
};

// ============================================
// CONFIGURATION DES BLOCS AVEC CHAMPS PDF
// ============================================

export const BLOCS_CONFIG = {
    aspect: {
        label: 'Aspect extérieur',
        description: 'Travaux modifiant l\'apparence du bâtiment',
        champs: ['couleurFacade', 'materiauFacade', 'couleurToiture', 'materiauToiture', 'hauteurConstruction'],
        cerfaRef: 'Cadre 4.1, 4.2'
    },
    construction: {
        label: 'Construction / Extension',
        description: 'Création de新的surface ou volume',
        champs: [
            'typeTravaux', 'nombreLogements', 'modeUtilisation', 'typeResidence',
            'nombreNiveauxDessus', 'nombreNiveauxDessous',
            'empriseSolExistante', 'empriseSolCreee', 'empriseSolSupprimee', 'empriseSolTotale',
            'surfacePlancherExistante', 'surfacePlancherCreee', 'surfacePlancherSupprimee', 'surfacePlancherTotale',
            'habitationExistante', 'habitationCreee', 'habitationSupprimee',
            'hebergementExistante', 'hebergementCreee', 'hebergementSupprimee'
        ],
        cerfaRef: 'Cadres 4.1, 4.2, 4.3, 4.4'
    },
    piscine: {
        label: 'Piscine / Bassin',
        description: 'Installation de piscine, spa ou bassin',
        champs: ['surfaceBassin', 'profondeurMoyenne', 'dispositifSecurite', 'piscineCouverte'],
        cerfaRef: 'Cadre 4.4'
    },
    cloture: {
        label: 'Clôture / Portail',
        description: 'Mise en place de clôture, mur, grillage',
        champs: ['hauteurMax', 'materiau', 'lineaireTotal', 'includePortail', 'typePortail'],
        cerfaRef: 'Cadre 4.1'
    },
    changementDestination: {
        label: 'Changement de destination',
        description: 'Transformation d\'un local vers un autre usage',
        champs: ['surfaceTransforme', 'destinationActuelle', 'destinationFuture'],
        cerfaRef: 'Cadre 4.4'
    },
    stationnement: {
        label: 'Stationnement',
        description: 'Obligations de stationnement',
        champs: ['placesAvant', 'placesApres', 'placesExterieures', 'adresseStationnement1', 'adresseStationnement2'],
        cerfaRef: 'Cadre 4.5',
        condition: (types) => types.includes('construction') || types.includes('extension') || types.includes('changement_destination')
    },
    solaire: {
        label: 'Installation solaire',
        description: 'Panneaux photovoltaïques',
        champs: ['puissanceCrete', 'destinationEnergie', 'puissanceElectrique', 'installationAgrivoltaïque'],
        cerfaRef: 'Cadre 4.2.1',
        condition: (types) => types.includes('solaire') || types.includes('toiture')
    },
    legislationsConnexes: {
        label: 'Législations connexes',
        description: 'Loi sur l\'eau, environnement, monuments',
        champs: ['iota', 'autorisationEnv', 'derogationEspeces', 'enregistrement', 'avisABF', 'autreLegislations', 'precisezAutreLegislations', 'raccordementChaleur', 'articleL1714', 'alleeArbres', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse'],
        cerfaRef: 'Cadre 5'
    }
};

// ============================================
// TYPES DE PROJETS AVEC LEURS BLOCS
// ============================================

export const PROJECT_TYPES_PDF = {
    nouvelleConstruction: {
        label: 'Nouvelle construction',
        icon: 'Home',
        blocs: ['construction', 'aspect', 'stationnement', 'legislationsConnexes'],
        champs: ['nouvelleConstruction', 'typeTravaux', 'nombreLogements', 'surfacePlancherCreee', 'empriseSolCreee'],
        legislationsChamps: ['iota', 'derogationEspeces', 'avisABF', 'autreLegislations', 'precisezAutreLegislations', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    extension: {
        label: 'Extension',
        icon: 'HomeWork',
        blocs: ['construction', 'aspect', 'stationnement', 'legislationsConnexes'],
        champs: ['typeTravaux', 'surfacePlancherCreee', 'empriseSolCreee', 'hauteurConstruction'],
        legislationsChamps: ['iota', 'derogationEspeces', 'avisABF', 'autreLegislations', 'precisezAutreLegislations', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    piscine: {
        label: 'Piscine',
        icon: 'Waves',
        blocs: ['piscine', 'legislationsConnexes'],
        champs: ['surfaceBassin', 'profondeurMoyenne', 'dispositifSecurite'],
        legislationsChamps: ['iota', 'derogationEspeces']
    },
    garage: {
        label: 'Garage / Carport',
        icon: 'Car',
        blocs: ['construction', 'aspect', 'stationnement'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee', 'nombreVehicules'],
        legislationsChamps: ['iota', 'derogationEspeces', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    veranda: {
        label: 'Véranda',
        icon: 'Layout',
        blocs: ['construction', 'aspect'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee', 'hauteurConstruction'],
        legislationsChamps: ['iota', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    abri_jardin: {
        label: 'Abri de jardin',
        icon: 'Cabin',
        blocs: ['construction'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee', 'hauteurConstruction'],
        legislationsChamps: ['iota', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    cloture: {
        label: 'Clôture / Portail',
        icon: 'Fence',
        blocs: ['cloture'],
        champs: ['hauteurMax', 'materiau', 'lineaireTotal', 'includePortail'],
        legislationsChamps: ['avisABF', 'alleeArbres', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    ravalement: {
        label: 'Ravalement de façade',
        icon: 'Hammer',
        blocs: ['aspect', 'legislationsConnexes'],
        champs: ['couleurFacade', 'materiauFacade'],
        legislationsChamps: ['avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    toiture: {
        label: 'Toiture',
        icon: 'Roofing',
        blocs: ['aspect', 'solaire', 'legislationsConnexes'],
        champs: ['couleurToiture', 'materiauToiture'],
        legislationsChamps: ['avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    terrasse: {
        label: 'Terrasse',
        icon: 'Deck',
        blocs: ['construction'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee'],
        legislationsChamps: ['iota', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    hangar: {
        label: 'Hangar',
        icon: 'Warehouse',
        blocs: ['construction', 'aspect', 'legislationsConnexes'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee', 'hauteurConstruction', 'nombreNiveauxDessus'],
        legislationsChamps: ['iota', 'enregistrement', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    surelevation: {
        label: 'Surélévation',
        icon: 'ArrowUpToLine',
        blocs: ['construction', 'aspect', 'legislationsConnexes'],
        champs: ['surfacePlancherCreee', 'empriseSolCreee', 'hauteurConstruction', 'nombreNiveauxDessus'],
        legislationsChamps: ['iota', 'avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    transformation_garage: {
        label: 'Transformation d\'un garage en pièce',
        icon: 'ArrowRightLeft',
        blocs: ['construction', 'legislationsConnexes'],
        champs: ['surfacePlancherCreee', 'modeUtilisation', 'nombreLogements'],
        legislationsChamps: ['avisABF', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    changement_destination: {
        label: 'Changement de destination',
        icon: 'ArrowRightLeft',
        blocs: ['changementDestination', 'stationnement', 'legislationsConnexes'],
        champs: ['surfaceTransforme', 'destinationActuelle', 'destinationFuture'],
        legislationsChamps: ['avisABF', 'autreLegislations', 'precisezAutreLegislations', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    },
    autre: {
        label: 'Autre projet',
        icon: 'MoreHoriz',
        blocs: ['legislationsConnexes'],
        champs: [],
        legislationsChamps: ['iota', 'autorisationEnv', 'derogationEspeces', 'enregistrement', 'avisABF', 'autreLegislations', 'precisezAutreLegislations', 'raccordementChaleur', 'articleL1714', 'alleeArbres', 'sitePatrimonialRemarquable', 'abordsMonumentHistorique', 'siteClasse']
    }
};

// ============================================
// LOGIQUE FISCALE
// ============================================

export const LOGIQUE_FISCALE = {
    taxeAmenagement: {
        label: 'Taxe d\'aménagement',
        condition: (champs) => {
            const surface = parseFloat(champs.surfacePlancherCreee) || 0;
            const emprise = parseFloat(champs.empriseSolCreee) || 0;
            return surface > 5 || emprise > 5;
        },
        champs: ['surfaceTaxable', 'puitsForage'],
        description: 'Applicable si surface créée > 5m²'
    },
    stationnement: {
        label: 'Obligations stationnement',
        condition: (champs, types) => {
            return types.includes('construction') || types.includes('extension') || types.includes('changement_destination');
        },
        champs: ['placesAvant', 'placesApres'],
        description: 'Obligatoire pour nouvelles constructions'
    },
    archeologie: {
        label: 'Redevance archéologique',
        condition: (champs) => {
            return champs.creusementProfond === true;
        },
        champs: ['creusementProfond'],
        description: 'Applicable si creusement > 50cm'
    },
    pvr: {
        label: 'Participation Voirie et Réseaux',
        condition: (champs, types, terrain) => {
            return terrain?.zonePVR === true;
        },
        champs: ['pvrParticulier', 'pvrNom', 'pvrAdresse'],
        description: 'Selon commune'
    }
};

export default CHAMPS_CERFA;
