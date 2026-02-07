import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    Collapse,
    Checkbox,
    FormControlLabel,
    Paper,
    Divider
} from '@mui/material';
import {
    Sparkles,
    Wand2,
    Info,
    CheckCircle2,
    Paintbrush,
    Hammer,
    Layout,
    Check
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { PROJECT_TYPES } from '../../config/projectConfigs';

const couleurOptions = ['Blanc', 'Blanc cassé', 'Beige', 'Gris clair', 'Gris foncé', 'Noir', 'Bleu', 'Vert', 'Marron', 'Rouge', 'Terracotta', 'Autre'];
const materiauFacadeOptions = ['Enduit', 'Crépi', 'Bardage bois', 'Bardage composite', 'Pierre', 'Brique', 'Parpaing', 'Béton', 'Verre', 'Métal', 'Autre'];
const materiauToitureOptions = ['Tuiles', 'Ardoises', 'Zinc', 'Bac acier', 'Toit terrasse', 'Membrane PVC', 'Chaume', 'Bois', 'Shingle', 'Autre'];

function Step6DescriptionProjet() {
    const {
        data,
        setField,
        setMultipleFields,
        errors,
        analyzeProjectWithAI,
        configureCustomProjectWithAI,
        generateDescriptionWithAI,
        projectConfig,
        isFieldRequired,
        dispatch
    } = useForm();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleDescriptionBlur = async () => {
        if (!data.descriptionProjet || data.descriptionProjet.length < 10) return;
        handleAIAnalysis();
        if (data.natureTravaux?.includes('autre')) {
            setIsConfiguring(true);
            try {
                const config = await configureCustomProjectWithAI(data.descriptionProjet);
                if (config) setField('aiProjectConfig', config);
            } finally {
                setIsConfiguring(false);
            }
        }
    };

    const handleGenerateDescription = async () => {
        // If we have a pre-generated description, use it instantly!
        if (data.preGeneratedDescription) {
            setField('descriptionProjet', data.preGeneratedDescription);
            setSnackbar({ open: true, message: 'Description générée instantanément !', severity: 'success' });

            // Trigger config after generation if it's 'autre'
            if (data.natureTravaux?.includes('autre')) {
                const config = await configureCustomProjectWithAI(data.preGeneratedDescription);
                if (config) setField('aiProjectConfig', config);
            }

            // Clear cache after use
            dispatch({ type: 'SET_PRE_GENERATED_DESCRIPTION', value: '' });
            return;
        }

        setIsGenerating(true);
        try {
            const description = await generateDescriptionWithAI(
                data.typeTravaux,
                data.natureTravaux,
                data.autreNatureTravaux
            );
            if (description) {
                setField('descriptionProjet', description);
                if (data.natureTravaux?.includes('autre')) {
                    const config = await configureCustomProjectWithAI(description);
                    if (config) setField('aiProjectConfig', config);
                }
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAIAnalysis = async () => {
        if (!data.descriptionProjet || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const suggestions = await analyzeProjectWithAI(data.descriptionProjet);
            if (suggestions) {
                const updates = {};
                if (suggestions.couleurFacade) updates.couleurFacade = suggestions.couleurFacade;
                if (suggestions.couleurToiture) updates.couleurToiture = suggestions.couleurToiture;
                if (suggestions.materiauFacade) updates.materiauFacade = suggestions.materiauFacade;
                if (suggestions.materiauToiture) updates.materiauToiture = suggestions.materiauToiture;
                if (suggestions.hauteurConstruction) updates.hauteurConstruction = suggestions.hauteurConstruction;
                setMultipleFields(updates);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const allFields = [...projectConfig.requiredFields, ...projectConfig.optionalFields];
    const showCouleurFacade = allFields.includes('couleurFacade');
    const showCouleurToiture = allFields.includes('couleurToiture');
    const showMateriauFacade = allFields.includes('materiauFacade');
    const showMateriauToiture = allFields.includes('materiauToiture');
    const showHauteur = allFields.includes('hauteurConstruction');
    const showMateriauxSection = showCouleurFacade || showCouleurToiture || showMateriauFacade || showMateriauToiture || showHauteur;

    const specificQuestions = projectConfig.specificQuestions || [];
    const selectedTypeLabels = (data.natureTravaux || []).map(t => PROJECT_TYPES[t]?.label || t);

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                L'IA Urbania analyse votre description pour pré-remplir les données techniques.
            </Typography>

            {selectedTypeLabels.length > 0 && (
                <Box sx={{ mb: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', tracking: '0.1em' }}>
                        Nature des travaux :
                    </Typography>
                    {selectedTypeLabels.map(label => (
                        <Chip key={label} label={label} sx={{ bgcolor: 'rgba(0, 35, 149, 0.05)', color: '#002395', fontWeight: 700, borderRadius: '10px' }} size="small" />
                    ))}
                </Box>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Box sx={{ position: 'relative' }}>
                        <FormField
                            label="Description détaillée"
                            name="descriptionProjet"
                            value={data.descriptionProjet}
                            onChange={handleChange}
                            onBlur={handleDescriptionBlur}
                            error={errors.descriptionProjet}
                            required
                            multiline
                            rows={5}
                            placeholder="Décrivez précisément votre projet..."
                        />
                        <Box sx={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 2 }}>
                            {data.preGeneratedDescription && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main', bgcolor: 'rgba(34, 197, 94, 0.1)', px: 1.5, py: 0.5, borderRadius: '20px' }}>
                                    <Check size={14} />
                                    <Typography variant="caption" fontWeight={700}>Prêt</Typography>
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || isConfiguring}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    bgcolor: '#002395',
                                    fontWeight: 600,
                                    boxShadow: data.preGeneratedDescription ? '0 0 15px rgba(0, 35, 149, 0.3)' : 'none',
                                    '&:hover': { bgcolor: '#001a6e' }
                                }}
                            >
                                {isGenerating ? 'Génération...' : 'IA : Rédiger pour moi'}
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                <Collapse in={showMateriauxSection} sx={{ width: '100%' }}>
                    <Grid item xs={12} sx={{ mt: 2, px: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Paintbrush size={22} color="#002395" />
                                <Typography variant="h6" fontWeight={700} color="#1e293b">Aspect extérieur</Typography>
                            </Box>

                            <Grid container spacing={3}>
                                {showCouleurFacade && (
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Couleur des façades</InputLabel>
                                            <Select value={data.couleurFacade || ''} label="Couleur des façades" onChange={(e) => handleChange('couleurFacade', e.target.value)} sx={{ borderRadius: '16px', bgcolor: 'white' }}>
                                                {couleurOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {showMateriauFacade && (
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Matériau des façades</InputLabel>
                                            <Select value={data.materiauFacade || ''} label="Matériau des façades" onChange={(e) => handleChange('materiauFacade', e.target.value)} sx={{ borderRadius: '16px', bgcolor: 'white' }}>
                                                {materiauFacadeOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {showCouleurToiture && (
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Couleur de la toiture</InputLabel>
                                            <Select value={data.couleurToiture || ''} label="Couleur de la toiture" onChange={(e) => handleChange('couleurToiture', e.target.value)} sx={{ borderRadius: '16px', bgcolor: 'white' }}>
                                                {couleurOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {showMateriauToiture && (
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Matériau de la toiture</InputLabel>
                                            <Select value={data.materiauToiture || ''} label="Matériau de la toiture" onChange={(e) => handleChange('materiauToiture', e.target.value)} sx={{ borderRadius: '16px', bgcolor: 'white' }}>
                                                {materiauToitureOptions.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {showHauteur && (
                                    <Grid item xs={12} sm={6}>
                                        <FormField label="Hauteur au faîtage" name="hauteurConstruction" value={data.hauteurConstruction} onChange={handleChange} type="number" endAdornment="m" />
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Collapse>

                {specificQuestions.length > 0 && (
                    <Grid item xs={12} sx={{ mt: 2, px: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Layout size={22} color="#002395" />
                            <Typography variant="h6" fontWeight={700} color="#1e293b">Questions IA</Typography>
                        </Box>
                        <Grid container spacing={3}>
                            {specificQuestions.map((q) => (
                                <Grid item xs={12} sm={6} key={q.field}>
                                    {q.type === 'select' ? (
                                        <FormControl fullWidth><InputLabel>{q.label}</InputLabel><Select value={data[q.field] || ''} label={q.label} onChange={(e) => handleChange(q.field, e.target.value)} sx={{ borderRadius: '16px' }}>{(q.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
                                    ) : q.type === 'boolean' ? (
                                        <FormControl fullWidth><InputLabel>{q.label}</InputLabel><Select value={data[q.field] === true ? 'oui' : data[q.field] === false ? 'non' : ''} label={q.label} onChange={(e) => handleChange(q.field, e.target.value === 'oui')} sx={{ borderRadius: '16px' }}><MenuItem value="oui">Oui</MenuItem><MenuItem value="non">Non</MenuItem></Select></FormControl>
                                    ) : (
                                        <FormField label={q.label} name={q.field} value={data[q.field]} onChange={handleChange} type={q.type} />
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Step6DescriptionProjet;
