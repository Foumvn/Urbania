import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { getProjectConfig, isFieldRequired, isDocumentRequired } from '../config/projectConfigs';

const FormContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

const initialState = {
    currentStep: 0,
    isComplete: false,
    data: {
        // Step 1: Type de déclarant
        typeDeclarant: 'particulier', // 'particulier' ou 'personne_morale'

        // Step 2: Identité (Particulier)
        civilite: '',
        nom: '',
        prenom: '',
        dateNaissance: '',
        lieuNaissance: '',

        // Step 2: Identité (Personne morale)
        denomination: '',
        raisonSociale: '',
        siret: '',
        typeSociete: '',
        representantNom: '',
        representantPrenom: '',
        representantQualite: '',

        // Step 3: Coordonnées
        numero: '', // Numéro de rue
        adresse: '', // Voie / Nom de rue
        lieuDit: '',
        localite: '',
        codePostal: '',
        bp: '',
        cedex: '',
        ville: '',
        pays: 'France',
        telephone: '',
        email: '',
        acceptEmail: false,

        // Step 4: Terrain
        terrainNumero: '',
        terrainAdresse: '',
        terrainLieuDit: '',
        terrainVille: '',
        terrainCodePostal: '',
        referenceCadastrale: '',
        prefixe: '',
        section: '',
        numeroParcelle: '',
        surfaceTerrain: '',
        surfaceTotale: '',
        certificatUrbanisme: 'non', // 'oui', 'non', 'nsp'
        lotissement: 'non', // 'oui', 'non', 'nsp'

        // Step 5: Type de travaux
        typeTravaux: 'construction', // 'construction', 'modification', 'amenagement', 'changement_destination'
        natureTravaux: [], // 'piscine', 'garage', etc.
        autreNatureTravaux: '',
        descriptionProjet: '',

        // Step 6: Description détaillée (Colors/Materials are extra)
        couleurFacade: '',
        couleurToiture: '',
        materiauFacade: '',
        materiauToiture: '',
        hauteurConstruction: '',

        // Nouveaux champs pour le PDF
        nombreLogements: '',
        logementsIndividuels: '',
        logementsCollectifs: '',
        modeUtilisation: 'personnel', // 'personnel', 'vente', 'location'
        typeResidence: 'principale', // 'principale', 'secondaire'

        // Step 7: Surfaces
        surfaceLogementExistante: '',
        surfaceLogementCreee: '',
        surfaceLogementSupprimee: '',
        surfaceLogementTotal: '',
        surfaceAnnexeExistante: '',
        surfaceAnnexeCreee: '',
        surfaceAnnexeSupprimee: '',
        surfaceAnnexeTotal: '',
        surfacePlancherExistante: '',
        surfacePlancherCreee: '',
        surfacePlancherSupprimee: '',
        surfacePlancherTotale: '',
        empriseSolExistante: '',
        empriseSolCreee: '',
        empriseSolSupprimee: '',
        empriseSolTotale: '',

        // Step 7.2: Stationnement
        placesAvant: '',
        placesApres: '',

        // Step 12: Législation connexe (Nouveau)
        iotaOui: false,
        autorisationEnv: false,
        derogationEspeces: false,
        sitePatrimonial: false,
        monumentHistorique: false,
        siteClasse: false,

        // Step 8: Pièces jointes
        hasPlanCoupe: false,
        hasPlanFacades: false,
        hasInsertion: false,
        hasPhotos: false,
        hasPhotosEnvironnement: false,
        piecesJointes: {
            dp1: null,
            dp2: null,
            dp3: null,
            dp4: null,
            dp6: null,
            autres: []
        },

        // Step 9: Engagements
        engagementExactitude: false,
        engagementReglementation: false,
        dateDeclaration: '',
        lieuDeclaration: '',

        // Step 11: Plan cadastral
        cadastralPlan: {
            mainParcel: {
                width: 20,
                depth: 25,
                buildingPosition: 'center',
                hasBuilding: true,
            },
            neighboringParcels: [],
            streets: [],
            orientation: 0,
            scale: '1:500',
        },
        aiProjectConfig: null,
        signature: null,    // Image de la signature numérique
        preGeneratedDescription: '', // Cache for background generation
    },
    errors: {},
    touched: {},
    isGeneratingDP1: false,
};

function formReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.field]: action.value,
                },
                touched: {
                    ...state.touched,
                    [action.field]: true,
                },
            };

        case 'SET_PRE_GENERATED_DESCRIPTION':
            return {
                ...state,
                data: {
                    ...state.data,
                    preGeneratedDescription: action.value
                }
            };

        case 'SET_MULTIPLE_FIELDS':
            return {
                ...state,
                data: {
                    ...state.data,
                    ...action.fields,
                },
            };

        case 'SET_ERROR':
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.field]: action.error,
                },
            };

        case 'CLEAR_ERROR':
            const { [action.field]: _, ...remainingErrors } = state.errors;
            return {
                ...state,
                errors: remainingErrors,
            };

        case 'SET_ERRORS':
            return {
                ...state,
                errors: action.errors,
            };

        case 'NEXT_STEP':
            return {
                ...state,
                currentStep: Math.min(state.currentStep + 1, 10),
            };

        case 'PREV_STEP':
            return {
                ...state,
                currentStep: Math.max(state.currentStep - 1, 0),
            };

        case 'GO_TO_STEP':
            return {
                ...state,
                currentStep: action.step,
            };

        case 'COMPLETE':
            return {
                ...state,
                isComplete: true,
            };

        case 'RESET':
            return initialState;

        case 'LOAD_STATE':
            return {
                ...initialState,
                ...action.state,
            };

        case 'SET_GENERATING_DP1':
            return {
                ...state,
                isGeneratingDP1: action.value
            };

        default:
            return state;
    }
}

export function FormProvider({ children }) {
    const [state, dispatch] = useReducer(formReducer, initialState);

    // Load from localStorage and backend on mount
    useEffect(() => {
        const savedState = loadFromStorage('urbania_cerfa_form');
        if (savedState) {
            dispatch({ type: 'LOAD_STATE', state: savedState });
        }

        const fetchBackendSession = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE}/sessions/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const session = await response.json();
                    if (session.data && Object.keys(session.data).length > 0) {
                        dispatch({
                            type: 'LOAD_STATE', state: {
                                data: session.data,
                                currentStep: session.current_step
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch session from backend', error);
            }
        };

        fetchBackendSession();
    }, []);

    // Save to localStorage and backend on changes
    useEffect(() => {
        saveToStorage('urbania_cerfa_form', state);

        const debouncedSave = setTimeout(async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                await fetch(`${API_BASE}/sessions/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        data: state.data,
                        currentStep: state.currentStep
                    }),
                });
            } catch (error) {
                console.error('Failed to save session to backend', error);
            }
        }, 1000);

        return () => clearTimeout(debouncedSave);
    }, [state.data, state.currentStep]);

    const setField = (field, value) => {
        dispatch({ type: 'SET_FIELD', field, value });
    };

    const setMultipleFields = (fields) => {
        dispatch({ type: 'SET_MULTIPLE_FIELDS', fields });
    };

    const setError = (field, error) => {
        dispatch({ type: 'SET_ERROR', field, error });
    };

    const clearError = (field) => {
        dispatch({ type: 'CLEAR_ERROR', field });
    };

    const setErrors = (errors) => {
        dispatch({ type: 'SET_ERRORS', errors });
    };

    const nextStep = () => {
        dispatch({ type: 'NEXT_STEP' });
    };

    const prevStep = () => {
        dispatch({ type: 'PREV_STEP' });
    };

    const goToStep = (step) => {
        dispatch({ type: 'GO_TO_STEP', step });
    };

    const complete = () => {
        dispatch({ type: 'COMPLETE' });
    };

    const reset = () => {
        dispatch({ type: 'RESET' });
        localStorage.removeItem('urbania_cerfa_form');
    };

    const getProgress = () => {
        const totalSteps = 11;
        return Math.round((state.currentStep / (totalSteps - 1)) * 100);
    };

    const loadDossier = async (id) => {
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE}/dossiers/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const dossier = await response.json();
                dispatch({
                    type: 'LOAD_STATE',
                    state: {
                        data: dossier.data,
                        currentStep: 10 // Default to summary for completed dossiers
                    }
                });
                return true;
            }
        } catch (error) {
            console.error('Failed to load dossier:', error);
        }
        return false;
    };

    const analyzeProjectWithAI = useCallback(async (description) => {
        const token = localStorage.getItem('access_token');
        if (!token || !description) return null;

        try {
            const response = await fetch(`${API_BASE}/ai/analyze-project/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description }),
            });
            if (response.ok) {
                const suggestions = await response.json();
                return suggestions;
            }
        } catch (error) {
            console.error('Failed to analyze project with AI:', error);
        }
        return null;
    }, []);

    const suggestDocumentsWithAI = useCallback(async (description) => {
        const token = localStorage.getItem('access_token');
        if (!token || !description) return null;

        try {
            const response = await fetch(`${API_BASE}/ai/suggest-documents/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description }),
            });
            if (response.ok) {
                const suggestions = await response.json();
                return suggestions;
            }
        } catch (error) {
            console.error('Failed to suggest documents with AI:', error);
        }
        return null;
    }, []);

    // Configure custom project using AI (for "autre" type)
    const configureCustomProjectWithAI = useCallback(async (description) => {
        const token = localStorage.getItem('access_token');
        if (!token || !description) return null;

        try {
            const response = await fetch(`${API_BASE}/ai/configure-project/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description }),
            });
            if (response.ok) {
                const config = await response.json();
                return config;
            }
        } catch (error) {
            console.error('Failed to configure custom project with AI:', error);
        }
        return null;
    }, []);

    const generateDescriptionWithAI = useCallback(async (projectType, natureTravaux, otherNature) => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/ai/generate-description/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type_travaux: projectType,
                    nature_travaux: natureTravaux,
                    autre_nature: otherNature
                }),
            });
            if (response.ok) {
                const result = await response.json();
                // Safely extract description string
                const desc = typeof result.description === 'object'
                    ? (result.description.description || JSON.stringify(result.description))
                    : result.description;
                return desc;
            }
        } catch (error) {
            console.error('Failed to generate description with AI:', error);
        }
        return null;
    }, []);

    const generateTechnicalDocument = useCallback(async (docType, data) => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/ai/generate-document/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ doc_type: docType, data }),
            });
            if (response.ok) {
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            }
        } catch (error) {
            console.error(`Failed to generate ${docType}:`, error);
        }
        return null;
    }, []);

    // Compute project configuration based on selected natureTravaux
    const projectConfig = useMemo(() => {
        const config = getProjectConfig(state.data.natureTravaux || []);

        // Merge with AI-generated configuration if present
        if (state.data.aiProjectConfig) {
            const aiConf = state.data.aiProjectConfig;

            if (aiConf.requiredFields) {
                config.requiredFields = Array.from(new Set([...config.requiredFields, ...aiConf.requiredFields]));
            }
            if (aiConf.requiredDocuments) {
                config.requiredDocuments = Array.from(new Set([...config.requiredDocuments, ...aiConf.requiredDocuments]));
            }
            if (aiConf.specificQuestions) {
                // Merge questions, avoiding duplicates by field
                const existingFields = new Set(config.specificQuestions.map(q => q.field));
                aiConf.specificQuestions.forEach(q => {
                    if (!existingFields.has(q.field)) {
                        config.specificQuestions.push(q);
                    }
                });
            }
            if (aiConf.pdfSections) {
                config.pdfSections = Array.from(new Set([...config.pdfSections, ...aiConf.pdfSections]));
            }
        }

        return config;
    }, [state.data.natureTravaux, state.data.aiProjectConfig]);

    const value = {
        ...state,
        dispatch,
        setField,
        setMultipleFields,
        setError,
        clearError,
        setErrors,
        nextStep,
        prevStep,
        goToStep,
        complete,
        reset,
        getProgress,
        loadDossier,
        analyzeProjectWithAI,
        suggestDocumentsWithAI,
        configureCustomProjectWithAI,
        generateDescriptionWithAI,
        generateTechnicalDocument,
        projectConfig,
        isFieldRequired: (field) => projectConfig.requiredFields.includes(field),
        isDocumentRequired: (docId) => projectConfig.requiredDocuments.includes(docId),
        setIsGeneratingDP1: (val) => dispatch({ type: 'SET_GENERATING_DP1', value: val }),
    };



    return (
        <FormContext.Provider value={value}>
            {children}
        </FormContext.Provider>
    );
}

export function useForm() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context;
}

export default FormContext;
