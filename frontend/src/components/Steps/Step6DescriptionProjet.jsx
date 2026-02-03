import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Snackbar, Alert, Chip, Collapse, Checkbox, FormControlLabel } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { useState } from 'react';
import { PROJECT_TYPES } from '../../config/projectConfigs';


const couleurOptions = [
    'Blanc',
    'Blanc cassé',
    'Beige',
    'Gris clair',
    'Gris foncé',
    'Noir',
    'Bleu',
    'Vert',
    'Marron',
    'Rouge',
    'Terracotta',
    'Autre',
];

const materiauFacadeOptions = [
    'Enduit',
    'Crépi',
    'Bardage bois',
    'Bardage composite',
    'Pierre',
    'Brique',
    'Parpaing',
    'Béton',
    'Verre',
    'Métal',
    'Autre',
];

const materiauToitureOptions = [
    'Tuiles',
    'Ardoises',
    'Zinc',
    'Bac acier',
    'Toit terrasse',
    'Membrane PVC',
    'Chaume',
    'Bois',
    'Shingle',
    'Autre',
];

function Step6DescriptionProjet() {
    const {
        data,
        setField,
        setMultipleFields,
        errors,
        analyzeProjectWithAI,
        configureCustomProjectWithAI,
        projectConfig,
        isFieldRequired
    } = useForm();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleAIConfig = async () => {
        if (!data.descriptionProjet) return;
        setIsConfiguring(true);
        try {
            const config = await configureCustomProjectWithAI(data.descriptionProjet);
            if (config) {
                setField('aiProjectConfig', config);
                setSnackbar({ open: true, message: 'Configuration du projet générée par l\'IA !', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Erreur lors de la configuration par l\'IA.', severity: 'error' });
            }
        } finally {
            setIsConfiguring(false);
        }
    };


    const handleAIAnalysis = async () => {
        if (!data.descriptionProjet) return;

        setIsAnalyzing(true);
        try {
            const suggestions = await analyzeProjectWithAI(data.descriptionProjet);
            if (suggestions) {
                const updates = {};
                let foundAnything = false;
                if (suggestions.couleurFacade) { updates.couleurFacade = suggestions.couleurFacade; foundAnything = true; }
                if (suggestions.couleurToiture) { updates.couleurToiture = suggestions.couleurToiture; foundAnything = true; }
                if (suggestions.materiauFacade) { updates.materiauFacade = suggestions.materiauFacade; foundAnything = true; }
                if (suggestions.materiauToiture) { updates.materiauToiture = suggestions.materiauToiture; foundAnything = true; }
                if (suggestions.hauteurConstruction) { updates.hauteurConstruction = suggestions.hauteurConstruction; foundAnything = true; }

                if (foundAnything) {
                    setMultipleFields(updates);
                    setSnackbar({ open: true, message: 'Détails extraits avec succès !', severity: 'success' });
                } else {
                    setSnackbar({ open: true, message: 'L\'IA n\'a pas trouvé de détails précis dans la description.', severity: 'info' });
                }
            } else {
                setSnackbar({ open: true, message: 'Erreur lors de l\'analyse du projet.', severity: 'error' });
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Déterminer quels champs afficher selon le type de projet
    const allFields = [...projectConfig.requiredFields, ...projectConfig.optionalFields];
    const showCouleurFacade = allFields.includes('couleurFacade');
    const showCouleurToiture = allFields.includes('couleurToiture');
    const showMateriauFacade = allFields.includes('materiauFacade');
    const showMateriauToiture = allFields.includes('materiauToiture');
    const showHauteur = allFields.includes('hauteurConstruction');
    const showMateriauxSection = showCouleurFacade || showCouleurToiture || showMateriauFacade || showMateriauToiture || showHauteur;

    // Récupérer les questions spécifiques pour les types sélectionnés
    const specificQuestions = projectConfig.specificQuestions || [];

    // Labels des types sélectionnés pour affichage
    const selectedTypeLabels = (data.natureTravaux || []).map(t => PROJECT_TYPES[t]?.label || t);


    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Description du projet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Décrivez votre projet. Les champs demandés s'adaptent automatiquement selon le type de travaux choisi.
            </Typography>

            {selectedTypeLabels.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
                        Type(s) de projet :
                    </Typography>
                    {selectedTypeLabels.map(label => (
                        <Chip key={label} label={label} color="primary" size="small" />
                    ))}
                </Box>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormField
                        label="Description détaillée du projet"
                        name="descriptionProjet"
                        value={data.descriptionProjet}
                        onChange={handleChange}
                        error={errors.descriptionProjet}
                        required
                        multiline
                        rows={4}
                        helpTooltip="Décrivez précisément votre projet : dimensions, emplacement sur le terrain, usage prévu..."
                        placeholder="Exemple: Construction d'une piscine enterrée de 8m x 4m avec plage en bois composite, située à 5m de la limite de propriété..."
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {data.natureTravaux?.includes('autre') && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={isConfiguring ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                                onClick={handleAIConfig}
                                disabled={isConfiguring || isAnalyzing || !data.descriptionProjet}
                                sx={{ borderRadius: 2 }}
                            >
                                {isConfiguring ? 'Configuration...' : 'IA : Configurer le dossier'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                            onClick={handleAIAnalysis}
                            disabled={isAnalyzing || isConfiguring || !data.descriptionProjet}
                            sx={{ borderRadius: 2 }}
                        >
                            {isAnalyzing ? 'Analyse...' : 'IA : Préciser les détails'}
                        </Button>
                    </Box>
                </Grid>

                {/* Section Couleurs et Matériaux - Affichée uniquement si pertinent */}
                <Collapse in={showMateriauxSection} sx={{ width: '100%' }}>
                    <Grid container spacing={3} sx={{ pl: 3, pr: 3, mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 2 }} fontWeight={500}>
                                Couleurs et matériaux
                            </Typography>
                        </Grid>

                        {showCouleurFacade && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required={isFieldRequired('couleurFacade')}>
                                    <InputLabel id="couleur-facade-label">
                                        Couleur des façades {isFieldRequired('couleurFacade') ? '*' : ''}
                                    </InputLabel>
                                    <Select
                                        labelId="couleur-facade-label"
                                        value={data.couleurFacade || ''}
                                        label={`Couleur des façades ${isFieldRequired('couleurFacade') ? '*' : ''}`}
                                        onChange={(e) => handleChange('couleurFacade', e.target.value)}
                                    >
                                        {couleurOptions.map((couleur) => (
                                            <MenuItem key={couleur} value={couleur}>{couleur}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {showCouleurToiture && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required={isFieldRequired('couleurToiture')}>
                                    <InputLabel id="couleur-toiture-label">
                                        Couleur de la toiture {isFieldRequired('couleurToiture') ? '*' : ''}
                                    </InputLabel>
                                    <Select
                                        labelId="couleur-toiture-label"
                                        value={data.couleurToiture || ''}
                                        label={`Couleur de la toiture ${isFieldRequired('couleurToiture') ? '*' : ''}`}
                                        onChange={(e) => handleChange('couleurToiture', e.target.value)}
                                    >
                                        {couleurOptions.map((couleur) => (
                                            <MenuItem key={couleur} value={couleur}>{couleur}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {showMateriauFacade && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required={isFieldRequired('materiauFacade')}>
                                    <InputLabel id="materiau-facade-label">
                                        Matériau des façades {isFieldRequired('materiauFacade') ? '*' : ''}
                                    </InputLabel>
                                    <Select
                                        labelId="materiau-facade-label"
                                        value={data.materiauFacade || ''}
                                        label={`Matériau des façades ${isFieldRequired('materiauFacade') ? '*' : ''}`}
                                        onChange={(e) => handleChange('materiauFacade', e.target.value)}
                                    >
                                        {materiauFacadeOptions.map((materiau) => (
                                            <MenuItem key={materiau} value={materiau}>{materiau}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {showMateriauToiture && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required={isFieldRequired('materiauToiture')}>
                                    <InputLabel id="materiau-toiture-label">
                                        Matériau de la toiture {isFieldRequired('materiauToiture') ? '*' : ''}
                                    </InputLabel>
                                    <Select
                                        labelId="materiau-toiture-label"
                                        value={data.materiauToiture || ''}
                                        label={`Matériau de la toiture ${isFieldRequired('materiauToiture') ? '*' : ''}`}
                                        onChange={(e) => handleChange('materiauToiture', e.target.value)}
                                    >
                                        {materiauToitureOptions.map((materiau) => (
                                            <MenuItem key={materiau} value={materiau}>{materiau}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {showHauteur && (
                            <Grid item xs={12} sm={6}>
                                <FormField
                                    label={`Hauteur de la construction ${isFieldRequired('hauteurConstruction') ? '*' : ''}`}
                                    name="hauteurConstruction"
                                    value={data.hauteurConstruction}
                                    onChange={handleChange}
                                    type="number"
                                    helpTooltip="Hauteur maximale au faîtage en mètres"
                                    placeholder="3.5"
                                    endAdornment="m"
                                />
                            </Grid>
                        )}
                    </Grid>
                </Collapse>

                {/* Questions spécifiques au type de projet */}
                {specificQuestions.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }} fontWeight={500}>
                            Détails spécifiques
                        </Typography>
                        <Grid container spacing={2}>
                            {specificQuestions.map((question) => (
                                <Grid item xs={12} sm={6} key={question.field}>
                                    {question.type === 'select' ? (
                                        <FormControl fullWidth>
                                            <InputLabel>{question.label}</InputLabel>
                                            <Select
                                                value={data[question.field] || ''}
                                                label={question.label}
                                                onChange={(e) => handleChange(question.field, e.target.value)}
                                            >
                                                {(question.options || []).map((opt) => (
                                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : question.type === 'boolean' ? (
                                        <FormControl fullWidth>
                                            <InputLabel>{question.label}</InputLabel>
                                            <Select
                                                value={data[question.field] === true ? 'oui' : data[question.field] === false ? 'non' : ''}
                                                label={question.label}
                                                onChange={(e) => handleChange(question.field, e.target.value === 'oui')}
                                            >
                                                <MenuItem value="oui">Oui</MenuItem>
                                                <MenuItem value="non">Non</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <FormField
                                            label={question.label}
                                            name={question.field}
                                            value={data[question.field]}
                                            onChange={handleChange}
                                            type={question.type === 'number' ? 'number' : 'text'}
                                        />
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Grid>

            {/* Section Logements (si construction ou extension) */}
            {(data.typeTravaux === 'construction' || data.natureTravaux?.includes('extension')) && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }} fontWeight={500}>
                        Informations sur les logements
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <FormField
                                label="Nombre de logements créés"
                                name="nombreLogements"
                                value={data.nombreLogements}
                                onChange={handleChange}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Mode d'utilisation</InputLabel>
                                <Select
                                    value={data.modeUtilisation || 'personnel'}
                                    label="Mode d'utilisation"
                                    onChange={(e) => handleChange('modeUtilisation', e.target.value)}
                                >
                                    <MenuItem value="personnel">Occupation personnelle</MenuItem>
                                    <MenuItem value="vente">Vente</MenuItem>
                                    <MenuItem value="location">Location</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {data.modeUtilisation === 'personnel' && (
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Type de résidence</InputLabel>
                                    <Select
                                        value={data.typeResidence || 'principale'}
                                        label="Type de résidence"
                                        onChange={(e) => handleChange('typeResidence', e.target.value)}
                                    >
                                        <MenuItem value="principale">Résidence principale</MenuItem>
                                        <MenuItem value="secondaire">Résidence secondaire</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}

            {/* Section Législation et Périmètres (Toujours utile pour le CERFA) */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }} fontWeight={500}>
                    Législation et protection
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={data.iotaOui || false} onChange={(e) => handleChange('iotaOui', e.target.checked)} />}
                            label={<Typography variant="body2">Soumis à la Loi sur l'eau (IOTA)</Typography>}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={data.monumentHistorique || false} onChange={(e) => handleChange('monumentHistorique', e.target.checked)} />}
                            label={<Typography variant="body2">Abords d'un monument historique</Typography>}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={data.sitePatrimonial || false} onChange={(e) => handleChange('sitePatrimonial', e.target.checked)} />}
                            label={<Typography variant="body2">Site patrimonial remarquable</Typography>}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={data.siteClasse || false} onChange={(e) => handleChange('siteClasse', e.target.checked)} />}
                            label={<Typography variant="body2">Site classé ou inscrit</Typography>}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Step6DescriptionProjet;
