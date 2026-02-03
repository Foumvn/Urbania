/**
 * Configuration centralisée des types de projets pour le formulaire CERFA.
 * Chaque type définit les champs obligatoires, les documents requis et les sections PDF.
 */

export const PROJECT_TYPES = {
    piscine: {
        label: 'Piscine',
        icon: 'Pool',
        requiredFields: ['surfaceTerrain', 'surfacePlancherCreee'],
        optionalFields: ['hauteurConstruction'],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp6', 'dp7', 'dp8'],
        optionalDocuments: ['dp4', 'dp5'],
        pdfSections: ['terrain', 'surfaces', 'description'],
        specificQuestions: [
            { field: 'piscineCouverture', label: 'Piscine couverte ?', type: 'boolean' },
            { field: 'piscineSecurite', label: 'Système de sécurité', type: 'select', options: ['Alarme', 'Barrière', 'Couverture', 'Abri'] },
            { field: 'piscineDimensions', label: 'Dimensions du bassin (L x l)', type: 'text' }
        ]
    },
    extension: {
        label: 'Extension',
        icon: 'HomeWork',
        requiredFields: ['surfaceTerrain', 'surfacePlancherCreee', 'hauteurConstruction', 'couleurFacade', 'materiauFacade', 'couleurToiture', 'materiauToiture'],
        optionalFields: [],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'],
        optionalDocuments: [],
        pdfSections: ['terrain', 'surfaces', 'description', 'materiaux', 'toiture'],
        specificQuestions: [
            { field: 'extensionUsage', label: 'Destination de l\'extension', type: 'select', options: ['Habitation', 'Garage', 'Bureau', 'Autre'] },
            { field: 'extensionEtages', label: 'Nombre de niveaux', type: 'number' }
        ]
    },
    cloture: {
        label: 'Clôture / Portail',
        icon: 'Fence',
        requiredFields: ['hauteurConstruction'],
        optionalFields: ['materiauFacade', 'couleurFacade'],
        requiredDocuments: ['dp1', 'dp2', 'dp4', 'dp5', 'dp7'],
        optionalDocuments: ['dp3', 'dp6', 'dp8'],
        pdfSections: ['terrain', 'description'],
        specificQuestions: [
            { field: 'clotureType', label: 'Type de clôture', type: 'select', options: ['Mur', 'Grillage', 'Bois', 'PVC', 'Mixte'] },
            { field: 'cloturePortail', label: 'Inclut un portail ?', type: 'boolean' },
            { field: 'clotureLineaire', label: 'Linéaire total (m)', type: 'number' }
        ]
    },
    garage: {
        label: 'Garage / Carport',
        icon: 'Garage',
        requiredFields: ['surfaceTerrain', 'surfacePlancherCreee', 'hauteurConstruction', 'materiauFacade', 'materiauToiture'],
        optionalFields: ['couleurFacade', 'couleurToiture'],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'],
        optionalDocuments: ['dp5'],
        pdfSections: ['terrain', 'surfaces', 'description', 'materiaux'],
        specificQuestions: [
            { field: 'garageType', label: 'Type', type: 'select', options: ['Garage fermé', 'Carport ouvert', 'Abri voiture'] },
            { field: 'garageVehicules', label: 'Nombre de véhicules', type: 'number' }
        ]
    },
    abri_jardin: {
        label: 'Abri de jardin',
        icon: 'Cabin',
        requiredFields: ['surfacePlancherCreee', 'hauteurConstruction'],
        optionalFields: ['materiauFacade', 'materiauToiture', 'couleurFacade'],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7'],
        optionalDocuments: ['dp5', 'dp8'],
        pdfSections: ['terrain', 'surfaces', 'description'],
        specificQuestions: [
            { field: 'abriUsage', label: 'Usage prévu', type: 'select', options: ['Rangement', 'Atelier', 'Local technique', 'Autre'] }
        ]
    },
    veranda: {
        label: 'Véranda',
        icon: 'Roofing',
        requiredFields: ['surfacePlancherCreee', 'hauteurConstruction', 'materiauFacade', 'materiauToiture', 'couleurFacade'],
        optionalFields: ['couleurToiture'],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'],
        optionalDocuments: [],
        pdfSections: ['terrain', 'surfaces', 'description', 'materiaux', 'toiture'],
        specificQuestions: [
            { field: 'verandaVitrages', label: 'Type de vitrage', type: 'select', options: ['Simple', 'Double', 'Triple'] },
            { field: 'verandaChauffee', label: 'Véranda chauffée ?', type: 'boolean' }
        ]
    },
    terrasse: {
        label: 'Terrasse',
        icon: 'Deck',
        requiredFields: ['surfacePlancherCreee'],
        optionalFields: ['hauteurConstruction'],
        requiredDocuments: ['dp1', 'dp2', 'dp3', 'dp6', 'dp7'],
        optionalDocuments: ['dp4', 'dp5', 'dp8'],
        pdfSections: ['terrain', 'surfaces', 'description'],
        specificQuestions: [
            { field: 'terrasseMateriau', label: 'Matériau du revêtement', type: 'select', options: ['Bois', 'Composite', 'Carrelage', 'Pierre', 'Béton'] },
            { field: 'terrasseSurelevee', label: 'Terrasse surélevée ?', type: 'boolean' }
        ]
    },
    toiture: {
        label: 'Toiture / Ravalement',
        icon: 'Roofing',
        requiredFields: ['materiauToiture', 'couleurToiture'],
        optionalFields: ['couleurFacade', 'materiauFacade'],
        requiredDocuments: ['dp1', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'],
        optionalDocuments: ['dp2', 'dp3'],
        pdfSections: ['terrain', 'description', 'toiture'],
        specificQuestions: [
            { field: 'toitureType', label: 'Type de travaux', type: 'select', options: ['Réfection complète', 'Changement matériau', 'Modification pente', 'Ravalement façade'] },
            { field: 'toitureIsolation', label: 'Isolation thermique ?', type: 'boolean' }
        ]
    },
    autre: {
        label: 'Autre',
        icon: 'MoreHoriz',
        requiredFields: [],
        optionalFields: ['surfaceTerrain', 'surfacePlancherCreee', 'hauteurConstruction', 'couleurFacade', 'materiauFacade', 'couleurToiture', 'materiauToiture'],
        requiredDocuments: ['dp1', 'dp7'], // Minimum obligatoire
        optionalDocuments: ['dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp8'],
        pdfSections: ['terrain', 'surfaces', 'description'],
        specificQuestions: [],
        useAI: true // Indique que l'IA doit analyser ce type
    }
};

/**
 * Documents DP avec leurs métadonnées
 */
export const DOCUMENTS_INFO = {
    dp1: { label: 'DP1 - Plan de situation', description: 'Plan permettant de situer le terrain dans la commune' },
    dp2: { label: 'DP2 - Plan de masse', description: 'Plan montrant le projet par rapport aux limites du terrain' },
    dp3: { label: 'DP3 - Plan de coupe', description: 'Coupe du terrain et de la construction projetée' },
    dp4: { label: 'DP4 - Façades et toitures', description: 'Plans des façades et toitures, état initial et futur' },
    dp5: { label: 'DP5 - Représentation extérieure', description: 'Document graphique montrant l\'aspect extérieur' },
    dp6: { label: 'DP6 - Insertion paysagère', description: 'Document graphique montrant le projet dans son environnement' },
    dp7: { label: 'DP7 - Photographie proche', description: 'Photo du terrain dans son environnement proche' },
    dp8: { label: 'DP8 - Photographie lointaine', description: 'Photo du terrain dans le paysage lointain' }
};

/**
 * Retourne la configuration pour un ou plusieurs types de projets
 * @param {string[]} projectTypes - Liste des types sélectionnés (natureTravaux)
 * @returns {Object} Configuration fusionnée
 */
export function getProjectConfig(projectTypes = []) {
    if (!projectTypes || projectTypes.length === 0) {
        return {
            requiredFields: [],
            optionalFields: [],
            requiredDocuments: ['dp1', 'dp7'], // Minimum CERFA
            optionalDocuments: Object.keys(DOCUMENTS_INFO),
            pdfSections: ['terrain', 'surfaces', 'description', 'materiaux', 'toiture'], // Tout afficher par défaut
            specificQuestions: [],
            useAI: false
        };
    }

    // Fusion des configurations si plusieurs types sont sélectionnés
    const mergedConfig = {
        requiredFields: new Set(),
        optionalFields: new Set(),
        requiredDocuments: new Set(),
        optionalDocuments: new Set(),
        pdfSections: new Set(),
        specificQuestions: [],
        useAI: false
    };

    projectTypes.forEach(type => {
        const config = PROJECT_TYPES[type];
        if (config) {
            config.requiredFields.forEach(f => mergedConfig.requiredFields.add(f));
            config.optionalFields.forEach(f => mergedConfig.optionalFields.add(f));
            config.requiredDocuments.forEach(d => mergedConfig.requiredDocuments.add(d));
            config.optionalDocuments.forEach(d => mergedConfig.optionalDocuments.add(d));
            if (config.pdfSections) {
                config.pdfSections.forEach(s => mergedConfig.pdfSections.add(s));
            }
            mergedConfig.specificQuestions.push(...config.specificQuestions);
            if (config.useAI) mergedConfig.useAI = true;
        }
    });

    // Nettoyer: si un champ est requis, il ne doit pas être dans optionnel
    mergedConfig.requiredFields.forEach(f => mergedConfig.optionalFields.delete(f));
    mergedConfig.requiredDocuments.forEach(d => mergedConfig.optionalDocuments.delete(d));

    return {
        requiredFields: Array.from(mergedConfig.requiredFields),
        optionalFields: Array.from(mergedConfig.optionalFields),
        requiredDocuments: Array.from(mergedConfig.requiredDocuments),
        optionalDocuments: Array.from(mergedConfig.optionalDocuments),
        pdfSections: Array.from(mergedConfig.pdfSections),
        specificQuestions: mergedConfig.specificQuestions,
        useAI: mergedConfig.useAI
    };
}


/**
 * Vérifie si un champ est requis pour le type de projet donné
 */
export function isFieldRequired(fieldName, projectTypes) {
    const config = getProjectConfig(projectTypes);
    return config.requiredFields.includes(fieldName);
}

/**
 * Vérifie si un document est requis pour le type de projet donné
 */
export function isDocumentRequired(docId, projectTypes) {
    const config = getProjectConfig(projectTypes);
    return config.requiredDocuments.includes(docId);
}

export default PROJECT_TYPES;
