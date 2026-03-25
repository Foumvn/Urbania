import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Chip, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Hash,
    Building2,
    Navigation,
    Search,
    CheckCircle2,
    Info,
    Move,
    LocateFixed,
    Scan,
    Loader2,
    AlertTriangle,
    FileText,
    Home
} from 'lucide-react';
import FormSelect from '../Common/FormSelect';
import { useForm } from '../../context/FormContext';
import { useNotification } from '../../context/NotificationContext';
import FormField from '../Common/FormField';

function Step4Terrain() {
    const { data, setField, errors, setIsGeneratingDP1, isGeneratingDP1, triggerMapGeneration, analyzePLU, isAnalyzingPLU, pluAnalysisError } = useForm();
    const { showNotification } = useNotification();
    const [searchPhase, setSearchPhase] = useState(0); // 0: Init, 1: Commune, 2: Section, 3: Parcelle
    const [cadastreAutoFill, setCadastreAutoFill] = useState({ loading: false, success: false, error: null });

    useEffect(() => {
        let interval;
        if (isGeneratingDP1) {
            setSearchPhase(1);
            interval = setInterval(() => {
                setSearchPhase(prev => (prev % 3) + 1);
            }, 1000);
        } else {
            setSearchPhase(0);
        }
        return () => clearInterval(interval);
    }, [isGeneratingDP1]);

    // Autocomplétion automatique des références cadastrales
    useEffect(() => {
        const numero = data.terrainNumero?.trim();
        const voie = data.terrainAdresse?.trim();
        const commune = data.terrainVille?.trim();
        const codePostal = data.terrainCodePostal?.trim();

        // Vérifier si tous les champs requis sont remplis
        const isAddressComplete = numero && voie && commune && codePostal;

        // Ne pas déclencher si déjà en cours ou si les champs cadastraux sont déjà remplis
        if (!isAddressComplete || cadastreAutoFill.loading || data.section || data.numeroParcelle) {
            return;
        }

        // Déclencher l'autocomplétion APRÈS la recherche (pas automatiquement)
        // handleAutoFillCadastre();
    }, [data.terrainNumero, data.terrainAdresse, data.terrainVille, data.terrainCodePostal]);

    const handleAutoFillCadastre = async () => {
        setCadastreAutoFill({ loading: true, success: false, error: null });

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE}/cadastre/from-address/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    numero: data.terrainNumero.trim(),
                    voie: data.terrainAdresse.trim(),
                    commune: data.terrainVille.trim(),
                    ...(data.terrainCodePostal?.trim() && { code_postal: data.terrainCodePostal.trim() })
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.section && result.numero) {
                    setField('section', result.section);
                    setField('numeroParcelle', result.numero);
                    if (result.surface && !data.surfaceTerrain) {
                        setField('surfaceTerrain', result.surface);
                    }
                    setCadastreAutoFill({ loading: false, success: true, error: null });
                    showNotification(`Références cadastrales trouvées automatiquement : Section ${result.section}, Parcelle ${result.numero}${result.surface ? ` (${result.surface} m²)` : ''}`, 'success');
                } else {
                    setCadastreAutoFill({ loading: false, success: false, error: 'Aucune parcelle trouvée' });
                    showNotification('Impossible de trouver les références cadastrales pour cette adresse', 'warning');
                }
            } else {
                const error = await response.json();
                setCadastreAutoFill({ loading: false, success: false, error: error.detail || 'Erreur lors de la recherche' });
                showNotification('Erreur lors de la recherche cadastrale', 'error');
            }
        } catch (error) {
            console.error('Erreur autocomplétion cadastrale:', error);
            setCadastreAutoFill({ loading: false, success: false, error: 'Erreur réseau' });
            showNotification('Erreur réseau lors de la recherche cadastrale', 'error');
        }
    };

    const getSearchText = () => {
        switch (searchPhase) {
            case 1: return "Identification de la commune...";
            case 2: return "Analyse du cadastre...";
            case 3: return "Centrage sur la parcelle...";
            default: return "Localisation en cours...";
        }
    };

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleSearch = () => {
        const missing = [];
        if (!data.terrainVille?.trim()) missing.push('la commune');
        if (!data.section?.trim()) missing.push('la section cadastrale');
        if (!data.numeroParcelle?.trim()) missing.push('le numéro de parcelle');

        if (missing.length) {
            showNotification(`Merci de renseigner ${missing.join(', ')} avant de lancer la recherche cadastrale.`, 'warning');
            return;
        }

        setIsGeneratingDP1(true);
        triggerMapGeneration();
        analyzePLU({
            commune: data.terrainVille,
            section: data.section,
            parcelle: data.numeroParcelle,
            description: data.descriptionProjet
        });
    };

    const formatUpdatedAt = (isoString) => {
        if (!isoString) return null;
        try {
            return new Date(isoString).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return isoString;
        }
    };

    const analysis = data.pluAnalysis;
    const structuredAnalysis = useMemo(() => ({
        zone: analysis?.zone || 'à vérifier',
        zone_description: analysis?.zone_description || "Information à confirmer auprès du service urbanisme",
        hauteur_max: analysis?.hauteur_max || 'à vérifier',
        emprise_sol: analysis?.emprise_sol || 'à vérifier',
        retraits: analysis?.retraits || 'à vérifier',
        stationnement: analysis?.stationnement || 'à vérifier',
        documents_reference: Array.isArray(analysis?.documents_reference) ? analysis.documents_reference : [],
        risques: Array.isArray(analysis?.risques) ? analysis.risques : [],
        observations: analysis?.observations || 'Consulter le PLU communal pour confirmation.'
    }), [analysis]);

    const renderList = (items, emptyLabel) => {
        if (!items?.length) {
            return <Chip label={emptyLabel} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />;
        }
        return (
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {items.map((item, idx) => (
                    <Chip key={`${item}-${idx}`} label={item} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(0,35,149,0.08)' }} />
                ))}
            </Stack>
        );
    };

    // Helper : Oui / Non / Je ne sais pas
    const SituationField = ({ label, fieldName }) => {
        const val = data[fieldName] || 'nsp';
        return (
            <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {label}
                </Typography>
                <ToggleButtonGroup
                    value={val}
                    exclusive
                    onChange={(_, v) => { if (v) handleChange(fieldName, v); }}
                    size="small"
                    sx={{ flexWrap: 'wrap', gap: 0.5 }}
                >
                    {[{v:'oui',l:'Oui'},{v:'non',l:'Non'},{v:'nsp',l:'Je ne sais pas'}].map(opt => (
                        <ToggleButton key={opt.v} value={opt.v} sx={{
                            borderRadius: '10px !important',
                            border: '1px solid #e2e8f0 !important',
                            fontWeight: 700, fontSize: '0.75rem',
                            px: 1.5, py: 0.5,
                            '&.Mui-selected': { bgcolor: '#002395', color: '#fff', borderColor: '#002395 !important' }
                        }}>
                            {opt.l}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
        );
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <AnimatePresence>
                {isGeneratingDP1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-[32px] border border-slate-200"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <CircularProgress 
                                size={48} 
                                sx={{ color: '#002395' }}
                            />
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-700 mb-1">
                                    Génération du plan cadastral
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {getSearchText()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SECTION 1: ADRESSE DU TERRAIN */}
            <Paper elevation={0} sx={{ mb: 4, p: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002395]">
                        <Home size={22} />
                    </div>
                    <div>
                        <Typography variant="h6" fontWeight={900} color="#1e293b">Adresse du terrain</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Cadre 3.1 — Localisation</Typography>
                    </div>
                </Box>

                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="N°"
                            name="terrainNumero"
                            value={data.terrainNumero ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: 5"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Voie"
                            name="terrainAdresse"
                            value={data.terrainAdresse ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: Avenue des Champs"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Lieu-dit (facultatif)"
                            name="terrainLieuDit"
                            value={data.terrainLieuDit ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: Les Jardins"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Code postal (facultatif)"
                            name="terrainCodePostal"
                            value={data.terrainCodePostal ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: 75008"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Commune *"
                            name="terrainVille"
                            value={data.terrainVille ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: Paris"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Surface du terrain (m²)"
                            name="surfaceTerrain"
                            value={data.surfaceTerrain ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: 500"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <button
                            onClick={handleAutoFillCadastre}
                            disabled={cadastreAutoFill.loading || !data.terrainNumero?.trim() || !data.terrainAdresse?.trim() || !data.terrainVille?.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {cadastreAutoFill.loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Rechercher ma parcelle
                        </button>
                    </Grid>
                </Grid>

                {/* Feedback de la recherche cadastrale */}
                {cadastreAutoFill.loading && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,35,149,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                        <Typography variant="body2" color="text.secondary">Recherche des références cadastrales en cours...</Typography>
                    </Box>
                )}

                {cadastreAutoFill.success && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(34,197,94,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircle2 size={18} className="text-green-600" />
                        <Typography variant="body2" color="success.main" fontWeight={600}>Références cadastrales trouvées !</Typography>
                    </Box>
                )}

                {cadastreAutoFill.error && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(239,68,68,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AlertTriangle size={18} className="text-red-600" />
                        <Typography variant="body2" color="error.main">{cadastreAutoFill.error}</Typography>
                    </Box>
                )}
            </Paper>

            {/* SECTION 2: LOCALISATION DU PROJET */}
            <Paper elevation={0} sx={{ mb: 4, p: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <div className="size-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <Typography variant="h6" fontWeight={900} color="#1e293b">Localisation du projet</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>Référencement IGN / Cadastre</Typography>
                    </div>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Section"
                            name="section"
                            value={data.section ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: AB"
                            InputProps={{
                                readOnly: true,
                                sx: { bgcolor: '#f8fafc' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="N° Parcelle"
                            name="numeroParcelle"
                            value={data.numeroParcelle ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: 1234"
                            InputProps={{
                                readOnly: true,
                                sx: { bgcolor: '#f8fafc' }
                            }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={handleSearch}
                        disabled={isGeneratingDP1 || !data.terrainVille?.trim() || !data.section?.trim() || !data.numeroParcelle?.trim()}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isGeneratingDP1 ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        Générer le plan cadastral
                    </button>
                </Box>
            </Paper>

            {/* SECTION 3: SITUATION JURIDIQUE */}
            <Paper elevation={0} sx={{ mb: 4, p: 4, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <FileText size={20} />
                    </div>
                    <Box>
                        <Typography variant="h6" fontWeight={900} color="#1e293b" sx={{ lineHeight: 1.1 }}>3.2 — Situation juridique du terrain</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Facultatif — peut faire valoir des droits à construire</Typography>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 1 }}>
                    Ces données sont facultatives, mais peuvent vous permettre de faire valoir des droits à construire ou de bénéficier d'impositions plus favorables.
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <SituationField label="Êtes-vous titulaire d'un certificat d'urbanisme pour ce terrain ?" fieldName="certificatUrbanisme" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SituationField label="Le terrain est-il situé dans un lotissement ?" fieldName="lotissement" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SituationField label="Le terrain est-il situé dans une Zone d'Aménagement Concertée (Z.A.C.) ?" fieldName="zoneZAC" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SituationField label="Le terrain fait-il partie d'un remembrement urbain (Association Foncière Urbaine) ?" fieldName="remembrement" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SituationField label="Le terrain est-il situé dans un périmètre ayant fait l'objet d'une convention P.U.P. ?" fieldName="perimetrePUP" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Si concerné : dates, numéros et dénominations"
                            name="dateLotissement"
                            value={data.dateLotissement ?? ''}
                            onChange={handleChange}
                            placeholder="Ex: Décision du 01/01/2020, n°2020-001..."
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default Step4Terrain;
