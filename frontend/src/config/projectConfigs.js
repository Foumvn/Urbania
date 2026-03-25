/**
 * Configuration centralisée des types de projets pour le formulaire CERFA.
 * Utilise le mapping complet des champs du PDF Cerfa 16702-02
 */

import {
    CHAMPS_CERFA,
    BLOCS_CONFIG,
    PROJECT_TYPES_PDF,
    LOGIQUE_FISCALE,
    DESTINATIONS_CERFA
} from './cerfaFieldsMapping';

// ============================================
// BLOCS DISPONIBLES
// ============================================

export const BLOCS = {
    ASPECT: 'aspect',
    CONSTRUCTION: 'construction',
    PISCINE: 'piscine',
    CLOTURE: 'cloture',
    CHANGEMENT_DESTINATION: 'changementDestination',
    STATIONNEMENT: 'stationnement',
    SOLAIRE: 'solaire',
    LEGISLATIONS_CONNEXES: 'legislationsConnexes'
};

export const BLOCS_INFO = {
    [BLOCS.ASPECT]: {
        label: 'Aspect extérieur',
        description: 'Travaux modifiant l\'apparence (façade, toiture, couleurs)',
        icon: 'Paintbrush',
        cerfaMapping: 'Cadre 4.1, 4.2'
    },
    [BLOCS.CONSTRUCTION]: {
        label: 'Construction / Extension',
        description: 'Création de surface ou volume (abri, garage, extension)',
        icon: 'Home',
        cerfaMapping: 'Cadres 4.1, 4.2, 4.3, 4.4'
    },
    [BLOCS.PISCINE]: {
        label: 'Piscine / Bassin',
        description: 'Installation de piscine, spa ou bassin',
        icon: 'Waves',
        cerfaMapping: 'Cadre 4.4'
    },
    [BLOCS.CLOTURE]: {
        label: 'Clôture / Portail',
        description: 'Mise en place de clôture, mur, grillage, portail',
        icon: 'Fence',
        cerfaMapping: 'Cadre 4.1'
    },
    [BLOCS.CHANGEMENT_DESTINATION]: {
        label: 'Changement de destination',
        description: 'Transformation d\'un local vers une autre usage',
        icon: 'ArrowRightLeft',
        cerfaMapping: 'Cadre 4.4'
    },
    [BLOCS.STATIONNEMENT]: {
        label: 'Stationnement',
        description: 'Obligations de stationnement selon PLU',
        icon: 'Car',
        cerfaMapping: 'Cadre 4.5'
    },
    [BLOCS.SOLAIRE]: {
        label: 'Installation solaire',
        description: 'Panneaux photovoltaïques',
        icon: 'Sun',
        cerfaMapping: 'Cadre 4.2.1'
    },
    [BLOCS.LEGISLATIONS_CONNEXES]: {
        label: 'Législations connexes',
        description: 'Loi sur l\'eau, environnement, monuments historiques',
        icon: 'FileText',
        cerfaMapping: 'Cadre 5'
    }
};

// ============================================
// TYPES DE PROJETS (utilise PROJECT_TYPES_PDF du mapping)
// ============================================

export const PROJECT_TYPES = PROJECT_TYPES_PDF;

// ============================================
// DOCUMENTS (pieces jointes)
// ============================================

export const DOCUMENTS_INFO = {
    dp1: { label: 'DP1 - Plan de situation', description: 'Plan cadastral avec emplacement du projet', required: true, cerfaRef: 'DPC1' },
    dp2: { label: 'DP2 - Plan de masse', description: 'Plan de l\'emprise au sol et limites du terrain', required: false, cerfaRef: 'DPC2' },
    dp3: { label: 'DP3 - Plan en coupe', description: 'Coupe du terrain et de la construction', required: false, cerfaRef: 'DPC3' },
    dp4: { label: 'DP4 - Façades et toitures', description: 'Plans des façades état initial et futur', required: false, cerfaRef: 'DPC4' },
    dp5: { label: 'DP5 - Représentation extérieure', description: 'Document graphique de l\'aspect extérieur', required: false, cerfaRef: 'DPC5' },
    dp6: { label: 'DP6 - Insertion paysagère', description: 'Projet dans son environnement', required: false, cerfaRef: 'DPC6' },
    dp7: { label: 'DP7 - Photo environnement proche', description: 'Photo du terrain proche', required: true, cerfaRef: 'DPC7' },
    dp8: { label: 'DP8 - Photo paysage lointain', description: 'Photo du terrain lointain', required: false, cerfaRef: 'DPC8' }
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Retourne les BLOCS activés pour un type de projet
 */
export function getBlocsFromTypes(types) {
    const blocs = new Set();
    (types || []).forEach(type => {
        const config = PROJECT_TYPES[type];
        if (config?.blocs) {
            config.blocs.forEach(b => blocs.add(b));
        }
    });
    return Array.from(blocs);
}

/**
 * Retourne tous les champs nécessaires pour les BLOCS activés
 */
export function getChampsForBlocs(blocs) {
    const champs = {};
    (blocs || []).forEach(blocKey => {
        const config = BLOCS_CONFIG[blocKey];
        if (config?.champs) {
            config.champs.forEach(fieldName => {
                champs[fieldName] = CHAMPS_CERFA[getChampCategory(fieldName)]?.[fieldName] || { label: fieldName, type: 'text' };
            });
        }
    });
    return champs;
}

function getChampCategory(fieldName) {
    const categories = ['terrain', 'natureTravaux', 'informationsComplementaires', 'solaire', 'reculCote', 'empriseSol', 'surfaces', 'stationnement', 'legislationsConnexes', 'pvr', 'aspectExterieur', 'piscine', 'cloture'];
    for (const cat of categories) {
        if (CHAMPS_CERFA[cat]?.[fieldName]) {
            return cat;
        }
    }
    return 'informationsComplementaires';
}

/**
 * Retourne la configuration pour un ou plusieurs types de projets
 */
export function getProjectConfig(projectTypes = []) {
    if (!projectTypes || projectTypes.length === 0) {
        return {
            blocs: [],
            champs: {},
            requiredDocuments: ['dp1', 'dp7'],
            optionalDocuments: Object.keys(DOCUMENTS_INFO),
            fiscalite: { taxeAmenagement: false, stationnement: false, archeologie: false },
            useAI: true
        };
    }

    const mergedConfig = {
        blocs: new Set(),
        champs: {},
        legislationsChamps: new Set(),
        requiredDocuments: new Set(['dp1', 'dp7']),
        optionalDocuments: new Set(),
        useAI: false,
        fiscalite: { taxeAmenagement: false, stationnement: false, archeologie: false }
    };

    projectTypes.forEach(type => {
        const config = PROJECT_TYPES[type];
        if (config) {
            // Ajouter les BLOCS
            config.blocs?.forEach(b => mergedConfig.blocs.add(b));

            // Ajouter les champs
            config.champs?.forEach(fieldName => {
                const champDef = getChampDef(fieldName);
                if (champDef) {
                    mergedConfig.champs[fieldName] = champDef;
                }
            });

            // Ajouter les champs de législations spécifiques au type
            config.legislationsChamps?.forEach(fieldName => {
                mergedConfig.legislationsChamps.add(fieldName);
                const champDef = getChampDef(fieldName);
                if (champDef) {
                    mergedConfig.champs[fieldName] = champDef;
                }
            });

            // Ajouter les documents requis selon le type
            const docs = getDocumentsForType(type);
            docs.required?.forEach(d => mergedConfig.requiredDocuments.add(d));
            docs.optional?.forEach(d => mergedConfig.optionalDocuments.add(d));

            // Configuration IA
            if (type === 'autre') mergedConfig.useAI = true;

            // Fiscalité
            if (['nouvelleConstruction', 'extension', 'garage', 'veranda', 'abri_jardin', 'hangar', 'terrasse', 'surelevation', 'transformation_garage'].includes(type)) {
                mergedConfig.fiscalite.taxeAmenagement = true;
                mergedConfig.fiscalite.stationnement = true;
                mergedConfig.fiscalite.archeologie = true;
            }
            if (type === 'piscine') {
                mergedConfig.fiscalite.taxeAmenagement = true;
                mergedConfig.fiscalite.archeologie = true;
            }
            if (type === 'changement_destination') {
                mergedConfig.fiscalite.stationnement = true;
            }
        }
    });

    // Nettoyer les documents
    mergedConfig.requiredDocuments.forEach(d => mergedConfig.optionalDocuments.delete(d));

    return {
        blocs: Array.from(mergedConfig.blocs),
        champs: mergedConfig.champs,
        legislationsChamps: Array.from(mergedConfig.legislationsChamps),
        requiredDocuments: Array.from(mergedConfig.requiredDocuments),
        optionalDocuments: Array.from(mergedConfig.optionalDocuments),
        useAI: mergedConfig.useAI,
        fiscalite: mergedConfig.fiscalite
    };
}

function getChampDef(fieldName) {
    // Chercher dans toutes les catégories
    const allCategories = [
        CHAMPS_CERFA.terrain,
        CHAMPS_CERFA.natureTravaux,
        CHAMPS_CERFA.informationsComplementaires,
        CHAMPS_CERFA.solaire,
        CHAMPS_CERFA.empriseSol,
        CHAMPS_CERFA.surfaces,
        CHAMPS_CERFA.stationnement,
        CHAMPS_CERFA.legislationsConnexes,
        CHAMPS_CERFA.aspectExterieur,
        CHAMPS_CERFA.piscine,
        CHAMPS_CERFA.cloture
    ];

    for (const category of allCategories) {
        if (category?.[fieldName]) {
            return category[fieldName];
        }
    }
    return null;
}

function getDocumentsForType(type) {
    const docsMap = {
        nouvelleConstruction: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        extension: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        piscine: { required: ['dp1', 'dp2', 'dp3', 'dp6', 'dp7', 'dp8'], optional: ['dp4', 'dp5'] },
        garage: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        veranda: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        abri_jardin: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7'], optional: ['dp5', 'dp8'] },
        cloture: { required: ['dp1', 'dp4', 'dp5', 'dp7'], optional: ['dp2', 'dp3', 'dp6', 'dp8'] },
        ravalement: { required: ['dp1', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'], optional: ['dp2', 'dp3'] },
        toiture: { required: ['dp1', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'], optional: ['dp2', 'dp3'] },
        terrasse: { required: ['dp1', 'dp2', 'dp6', 'dp7'], optional: ['dp3', 'dp4', 'dp5', 'dp8'] },
        hangar: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        surelevation: { required: ['dp1', 'dp2', 'dp3', 'dp4', 'dp6', 'dp7', 'dp8'], optional: ['dp5'] },
        transformation_garage: { required: ['dp1', 'dp2', 'dp4', 'dp5', 'dp6', 'dp7'], optional: ['dp3', 'dp8'] },
        changement_destination: { required: ['dp1', 'dp2', 'dp4', 'dp5', 'dp6', 'dp7', 'dp8'], optional: ['dp3'] },
        autre: { required: ['dp1', 'dp7'], optional: ['dp2', 'dp3', 'dp4', 'dp5', 'dp6', 'dp8'] }
    };
    return docsMap[type] || { required: ['dp1', 'dp7'], optional: [] };
}

/**
 * Retourne les champs fiscaux selon la configuration
 */
export function getChampsFiscaux(fiscalite) {
    const champs = {};

    if (fiscalite.taxeAmenagement) {
        Object.assign(champs, {
            surfaceTaxable: CHAMPS_CERFA.surfaces.surfacePlancherCreee,
            puitsForage: { label: 'Puit ou forage prévu ?', type: 'select', options: ['Oui', 'Non'] }
        });
    }

    if (fiscalite.stationnement) {
        Object.assign(champs, {
            placesAvant: CHAMPS_CERFA.stationnement.placesAvant,
            placesApres: CHAMPS_CERFA.stationnement.placesApres
        });
    }

    if (fiscalite.archeologie) {
        Object.assign(champs, {
            creusementProfond: { label: 'Creusez-vous à plus de 50cm ?', type: 'select', options: ['Oui', 'Non'] }
        });
    }

    return champs;
}

/**
 * Vérifie si un champ est requis pour le type de projet donné
 */
export function isFieldRequired(fieldName, projectTypes) {
    const config = getProjectConfig(projectTypes);
    return config.requiredDocuments.includes(fieldName);
}

/**
 * Vérifie si un document est requis pour le type de projet donné
 */
export function isDocumentRequired(docId, projectTypes) {
    const config = getProjectConfig(projectTypes);
    return config.requiredDocuments.includes(docId);
}

/**
 * Vérifie si un BLOC est actif pour les types de projets
 */
export function isBlocActive(bloc, projectTypes) {
    const blocs = getBlocsFromTypes(projectTypes);
    return blocs.includes(bloc);
}

export { CHAMPS_CERFA, BLOCS_CONFIG, LOGIQUE_FISCALE, DESTINATIONS_CERFA };
export default PROJECT_TYPES;
