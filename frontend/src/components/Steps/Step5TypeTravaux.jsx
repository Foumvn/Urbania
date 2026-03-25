import React, { useState } from 'react';
import {
    Box, Typography, Grid, Chip, Paper, CircularProgress,
    Alert, Collapse, Checkbox, FormControlLabel, Divider
} from '@mui/material';
import {
    Waves, Warehouse, Home, Fence, Layout, Hammer,
    MoreHorizontal, Sparkles, CheckCircle2, ArrowUpToLine,
    ArrowRightLeft, Layers, TreePine, Car
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { BLOCS, BLOCS_INFO, getProjectConfig } from '../../config/projectConfigs';

// ============================================================
// TYPES OFFICIELS DU CERFA 16702-02 (cadre 4.2)
// ============================================================
const CERFA_TYPES = [
    { value: 'piscine', label: 'Piscine', icon: Waves, cerfaRef: '4.2' },
    { value: 'garage', label: 'Garage / Carport', icon: Car, cerfaRef: '4.2' },
    { value: 'veranda', label: 'Véranda', icon: Layout, cerfaRef: '4.2' },
    { value: 'abri_jardin', label: 'Abri de jardin', icon: TreePine, cerfaRef: '4.2' },
    { value: 'extension', label: 'Extension', icon: Home, cerfaRef: '4.2' },
    { value: 'surelevation', label: 'Surélévation', icon: ArrowUpToLine, cerfaRef: '4.2' },
    { value: 'transformation_garage', label: 'Transformation d\'un garage', icon: ArrowRightLeft, cerfaRef: '4.2' },
    { value: 'hangar', label: 'Hangar', icon: Warehouse, cerfaRef: '4.2' },
    { value: 'terrasse', label: 'Terrasse', icon: Layers, cerfaRef: '4.2' },
    { value: 'cloture', label: 'Clôture / Portail', icon: Fence, cerfaRef: '4.1' },
    { value: 'ravalement', label: 'Ravalement façade', icon: Hammer, cerfaRef: '4.1' },
    { value: 'toiture', label: 'Toiture', icon: Home, cerfaRef: '4.2' },
    { value: 'changement_destination', label: 'Changement de destination', icon: ArrowRightLeft, cerfaRef: '4.1' },
    { value: 'autre', label: 'Autre projet', icon: MoreHorizontal, cerfaRef: null },
];

// Nature générale du projet (cases à cocher CERFA 4.1)
const NATURE_TRAVAUX_OPTIONS = [
    { value: 'nouvelle_construction', label: 'Nouvelle construction' },
    { value: 'travaux_changement_destination', label: 'Travaux ou changement de destination sur une construction existante' },
    { value: 'cloture', label: 'Clôture' },
];

// Blocs visuels par couleur
const TYPE_COLORS = {
    piscine: '#06b6d4',
    garage: '#64748b',
    veranda: '#8b5cf6',
    abri_jardin: '#10b981',
    extension: '#002395',
    surelevation: '#f59e0b',
    transformation_garage: '#3b82f6',
    hangar: '#78716c',
    terrasse: '#84cc16',
    cloture: '#6366f1',
    ravalement: '#f97316',
    toiture: '#ef4444',
    changement_destination: '#ec4899',
    autre: '#94a3b8',
};

function Step5TypeTravaux() {
    const { data, setField, setMultipleFields, configureCustomProjectWithAI } = useForm();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showFreeDescription, setShowFreeDescription] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // ── Sélection du type précis (unique) ──────────────────────────────
    const handleTypeSelect = (value) => {
        const isAlreadySelected = data.natureTravaux?.includes(value);

        if (isAlreadySelected) {
            // Désélection
            setField('natureTravaux', []);
            setField('typeTravaux', null);
        } else {
            setField('natureTravaux', [value]);
            setField('typeTravaux', value);

            // Recalcule la nature générale automatiquement
            if (['piscine', 'garage', 'veranda', 'abri_jardin', 'extension',
                'surelevation', 'hangar', 'terrasse', 'transformation_garage'].includes(value)) {
                setField('natureGenerale', 'nouvelle_construction');
            } else if (['ravalement', 'toiture', 'changement_destination'].includes(value)) {
                setField('natureGenerale', 'travaux_changement_destination');
            } else if (value === 'cloture') {
                setField('natureGenerale', 'cloture');
            }

            if (value === 'autre') {
                setShowFreeDescription(true);
            } else {
                setShowFreeDescription(false);
                setAnalysisResult(null);
            }
        }
    };

    // ── Sélection nature générale (cases CERFA 4.1) ────────────────────
    const handleNatureGeneraleChange = (value) => {
        setField('natureGenerale', data.natureGenerale === value ? null : value);
    };

    // ── Analyse IA ─────────────────────────────────────────────────────
    const handleFreeDescriptionChange = (value) => {
        setField('descriptionLibreProjet', value);
    };

    const analyzeFreeDescription = async () => {
        if (!data.descriptionLibreProjet || data.descriptionLibreProjet.length < 10) return;
        setIsAnalyzing(true);
        try {
            const config = await configureCustomProjectWithAI(data.descriptionLibreProjet);
            if (config) {
                setField('aiProjectConfig', config);
                setField('natureTravaux', config.suggestedTypes || ['autre']);
                setField('descriptionProjet', data.descriptionLibreProjet);
                if (config.activatedBlocs) {
                    setAnalysisResult({
                        blocs: config.activatedBlocs,
                        projectType: config.projectType || 'autre',
                        summary: config.summary
                    });
                }
            }
        } catch (err) {
            console.error('Erreur analyse IA:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const projectConfig = getProjectConfig(data.natureTravaux || []);
    const activatedBlocs = projectConfig.blocs || [];
    const selectedType = (data.natureTravaux || [])[0];

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}>
                Sélectionnez le type de projet. Le formulaire s'adaptera automatiquement pour afficher
                uniquement les champs officiels du CERFA 16702-02 correspondants.
            </Typography>

            {/* ── Cadre 4.1 — Nature générale ───────────────────────── */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 8, height: 24, borderRadius: '4px', bgcolor: '#002395' }} />
                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                        Cadre 4.1 — Nature des travaux envisagés
                    </Typography>
                    <Chip label="CERFA officiel" size="small" sx={{ bgcolor: 'rgba(0,35,149,0.08)', color: '#002395', fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cochez la case correspondant à la nature principale de vos travaux :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {NATURE_TRAVAUX_OPTIONS.map(opt => (
                        <FormControlLabel
                            key={opt.value}
                            control={
                                <Checkbox
                                    checked={data.natureGenerale === opt.value}
                                    onChange={() => handleNatureGeneraleChange(opt.value)}
                                    sx={{
                                        color: '#cbd5e1',
                                        '&.Mui-checked': { color: '#002395' }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" fontWeight={data.natureGenerale === opt.value ? 600 : 400} color="#1e293b">
                                    {opt.label}
                                </Typography>
                            }
                        />
                    ))}
                </Box>
            </Paper>

            {/* ── Cadre 4.2 — Type précis ────────────────────────────── */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 8, height: 24, borderRadius: '4px', bgcolor: '#002395' }} />
                        <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                            Cadre 4.2 — Type de travaux précis
                        </Typography>
                    </Box>
                    <Chip
                        label="Décrire librement avec l'IA"
                        icon={<Sparkles size={13} />}
                        onClick={() => { setShowFreeDescription(true); setField('natureTravaux', ['autre']); }}
                        size="small"
                        sx={{ cursor: 'pointer', bgcolor: 'rgba(0,35,149,0.08)', color: '#002395', fontWeight: 600 }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sélectionnez le type correspondant à votre projet :
                </Typography>

                <Grid container spacing={2}>
                    {CERFA_TYPES.map(type => {
                        const isSelected = selectedType === type.value;
                        const color = TYPE_COLORS[type.value] || '#64748b';
                        const Icon = type.icon;
                        return (
                            <Grid item xs={6} sm={4} md={3} key={type.value}>
                                <Paper
                                    elevation={0}
                                    onClick={() => handleTypeSelect(type.value)}
                                    sx={{
                                        p: 2.5,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: isSelected ? color : '#f1f5f9',
                                        borderRadius: '20px',
                                        bgcolor: isSelected ? `${color}08` : 'white',
                                        transition: 'all 0.25s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            borderColor: `${color}80`,
                                            transform: 'translateY(-3px)',
                                            boxShadow: `0 8px 24px -6px ${color}25`,
                                        },
                                    }}
                                >
                                    {isSelected && (
                                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <CheckCircle2 size={16} color={color} />
                                        </Box>
                                    )}
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mx: 'auto', mb: 1.5,
                                        bgcolor: isSelected ? color : `${color}12`,
                                        transition: 'all 0.25s ease',
                                    }}>
                                        <Icon size={22} color={isSelected ? 'white' : color} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={isSelected ? 700 : 500}
                                        color={isSelected ? color : '#475569'} sx={{ lineHeight: 1.3, fontSize: '0.8rem' }}>
                                        {type.label}
                                    </Typography>
                                    {type.cerfaRef && (
                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                            CERFA {type.cerfaRef}
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* ── Zone IA — Projet libre ─────────────────────────────── */}
            <Collapse in={showFreeDescription}>
                <Paper elevation={0} sx={{
                    p: 4, mb: 4, borderRadius: '24px',
                    border: '2px solid', borderColor: 'primary.main',
                    bgcolor: 'rgba(0,35,149,0.02)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Sparkles size={22} color="#002395" />
                        <Typography variant="h6" fontWeight={700} color="#1e293b">
                            Analyse IA de votre projet
                        </Typography>
                        <Chip
                            label="Choisir un type"
                            onClick={() => { setShowFreeDescription(false); setField('natureTravaux', []); setAnalysisResult(null); }}
                            size="small" variant="outlined"
                            sx={{ cursor: 'pointer', ml: 'auto' }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Décrivez votre projet en quelques mots. L'IA identifiera automatiquement les champs CERFA nécessaires.
                    </Typography>

                    <FormField
                        label="Décrivez votre projet"
                        name="descriptionLibreProjet"
                        value={data.descriptionLibreProjet}
                        onChange={handleFreeDescriptionChange}
                        placeholder="Ex : Je souhaite construire une petite maison pour mon chien au fond du jardin..."
                        multiline
                        rows={3}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                        <Paper
                            component="button"
                            onClick={analyzeFreeDescription}
                            disabled={isAnalyzing || !data.descriptionLibreProjet}
                            elevation={0}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1,
                                px: 3, py: 1.5, borderRadius: '12px',
                                bgcolor: '#002395', color: 'white',
                                border: 'none', cursor: 'pointer', fontWeight: 600,
                                '&:hover': { bgcolor: '#001a6e' },
                                '&:disabled': { bgcolor: '#94a3b8', cursor: 'not-allowed' }
                            }}
                        >
                            {isAnalyzing ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                            {isAnalyzing ? 'Analyse...' : 'Analyser avec l\'IA'}
                        </Paper>
                    </Box>

                    {/* Résultat analyse IA */}
                    <Collapse in={!!analysisResult}>
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="success" icon={<CheckCircle2 />} sx={{ borderRadius: '12px', mb: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    Projet identifié : {analysisResult?.projectType}
                                </Typography>
                                <Typography variant="caption">{analysisResult?.summary}</Typography>
                            </Alert>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Catégories CERFA activées :
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {(analysisResult?.blocs || []).map(bloc => {
                                    const info = BLOCS_INFO[bloc];
                                    return (
                                        <Chip
                                            key={bloc}
                                            label={info?.label || bloc}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    </Collapse>
                </Paper>
            </Collapse>

            {/* ── Résumé blocs activés ───────────────────────────────── */}
            {activatedBlocs.length > 0 && !showFreeDescription && (
                <Paper elevation={0} sx={{
                    mt: 3, p: 3, borderRadius: '16px',
                    bgcolor: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)'
                }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#10b981" sx={{ mb: 1.5 }}>
                        ✓ Champs CERFA qui seront affichés à l'étape suivante :
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {activatedBlocs.map(bloc => {
                            const info = BLOCS_INFO[bloc];
                            return (
                                <Chip
                                    key={bloc}
                                    label={`${info?.label || bloc} (${info?.cerfaMapping || ''})`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}
                                />
                            );
                        })}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

export default Step5TypeTravaux;
