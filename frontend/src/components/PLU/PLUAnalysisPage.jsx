import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    Stack,
    Chip,
    Divider,
    CircularProgress,
    IconButton,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { MapPin, Landmark, FileText, RefreshCcw, History as HistoryIcon, ChevronDown, BookOpen, AlertTriangle, Link, CheckSquare, FileSearch } from 'lucide-react';
import { analyzePLU, fetchPLUHistory } from '../../services/pluService';
import { normalizePLUAnalysis } from '../../utils/pluFormatter';
import { useNotification } from '../../context/NotificationContext';

const formatDate = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (err) {
        return iso;
    }
};

const emptyForm = {
    commune: '',
    section: '',
    parcelle: '',
    description: ''
};

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

const PLUAnalysisPage = () => {
    const [form, setForm] = useState(emptyForm);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const { showNotification } = useNotification();

    const loadHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            const data = await fetchPLUHistory();
            setHistory(data);
        } catch (error) {
            console.error('PLU history error:', error);
            showNotification("Impossible de charger l'historique des analyses.", 'error');
        } finally {
            setHistoryLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.commune.trim()) {
            showNotification('Merci de renseigner la commune.', 'warning');
            return;
        }

        setIsAnalyzing(true);
        try {
            const { analysis: rawAnalysis, record } = await analyzePLU(form);
            const normalized = normalizePLUAnalysis(rawAnalysis);
            setAnalysis({
                data: normalized,
                updatedAt: record?.created_at || new Date().toISOString(),
                source: record ? 'api' : 'instant'
            });
            showNotification('Analyse PLU générée avec succès.', 'success');
            if (record) {
                await loadHistory();
            }
        } catch (error) {
            console.error('Analyse PLU error:', error);
            const message = error.response?.data?.error || "L'analyse PLU a échoué.";
            showNotification(message, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSelectHistory = (entry) => {
        if (!entry?.response) {
            showNotification('Aucune donnée enregistrée pour cette analyse.', 'warning');
            return;
        }
        setForm({
            commune: entry.commune || '',
            section: entry.section || '',
            parcelle: entry.parcelle || '',
            description: entry.description || ''
        });
        setAnalysis({
            data: normalizePLUAnalysis(entry.response),
            updatedAt: entry.created_at,
            source: 'history'
        });
    };

    const structuredAnalysis = useMemo(() => analysis?.data || null, [analysis]);

    return (
        <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100%', bgcolor: 'background.default' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                    Analyse avancée du PLU
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900 }}>
                    Lancez des analyses ciblées par commune et référence cadastrale, consultez l'historique de vos recherches
                    et obtenez un résumé instantané des règles de hauteur, emprise, retraits, stationnement et servitudes.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 4, borderRadius: '28px', border: '1px solid rgba(0, 35, 149, 0.08)' }}>
                        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                            <Box className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center text-[#002395]">
                                <MapPin size={22} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                    Paramètres de recherche
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    Commune obligatoire • Section & parcelle facultatives
                                </Typography>
                            </Box>
                        </Stack>

                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Commune"
                                    name="commune"
                                    value={form.commune}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex : Bordeaux"
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                                    <TextField
                                        label="Section"
                                        name="section"
                                        value={form.section}
                                        onChange={handleChange}
                                        placeholder="Ex : CW"
                                    />
                                    <TextField
                                        label="N° Parcelle"
                                        name="parcelle"
                                        value={form.parcelle}
                                        onChange={handleChange}
                                        placeholder="Ex : 71"
                                    />
                                </Stack>
                                <TextField
                                    label="Description du projet"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Usage, typologie, contraintes spécifiques..."
                                    multiline
                                    minRows={3}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isAnalyzing}
                                    startIcon={isAnalyzing ? <CircularProgress size={18} color="inherit" /> : <Landmark size={18} />}
                                    sx={{ fontWeight: 700, py: 1.4, borderRadius: '18px' }}
                                >
                                    {isAnalyzing ? 'Analyse en cours...' : 'Analyser la réglementation locale'}
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 4, borderRadius: '28px', border: '1px solid rgba(0, 35, 149, 0.08)', minHeight: 420 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Box>
                                <Typography variant="overline" fontWeight={800} color="primary.main" letterSpacing={2}>
                                    Synthèse réglementaire
                                </Typography>
                                <Typography variant="h5" fontWeight={900}>
                                    {structuredAnalysis ? structuredAnalysis.zone : 'Aucune analyse active'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {structuredAnalysis ? structuredAnalysis.zone_description : 'Lancez une recherche pour afficher les prescriptions du PLU.'}
                                </Typography>
                            </Box>
                            {analysis?.updatedAt && (
                                <Chip
                                    label={`Maj: ${formatDate(analysis.updatedAt)}`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Stack>

                        {!structuredAnalysis ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body1" fontWeight={600}>
                                    Renseignez une commune et lancez l'analyse pour visualiser les règles locales.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                {/* Démarche administrative — bandeau */}
                                {structuredAnalysis.demarche_admin && structuredAnalysis.demarche_admin !== 'À déterminer selon la surface du projet' && (
                                    <Alert
                                        severity="info"
                                        icon={<CheckSquare size={18} />}
                                        sx={{ borderRadius: '14px', fontWeight: 600 }}
                                    >
                                        <Typography variant="body2" fontWeight={700}>Démarche administrative</Typography>
                                        <Typography variant="body2">{structuredAnalysis.demarche_admin}</Typography>
                                    </Alert>
                                )}

                                {/* Grille des règles clés */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">Hauteur maximale</Typography>
                                        <Typography variant="body1" fontWeight={700}>{structuredAnalysis.hauteur_max}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">Emprise au sol</Typography>
                                        <Typography variant="body1" fontWeight={700}>{structuredAnalysis.emprise_sol}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">Retraits</Typography>
                                        <Typography variant="body1" fontWeight={700}>{structuredAnalysis.retraits}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">Stationnement</Typography>
                                        <Typography variant="body1" fontWeight={700}>{structuredAnalysis.stationnement}</Typography>
                                    </Grid>
                                    {structuredAnalysis.espaces_verts && structuredAnalysis.espaces_verts !== 'à vérifier' && (
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">Espaces verts / pleine terre</Typography>
                                            <Typography variant="body1" fontWeight={700}>{structuredAnalysis.espaces_verts}</Typography>
                                        </Grid>
                                    )}
                                </Grid>

                                <Divider />

                                {/* Documents de référence */}
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>Documents de référence</Typography>
                                    {renderList(structuredAnalysis.documents_reference, 'Non renseigné')}
                                </Box>

                                {/* Risques */}
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>Risques / servitudes</Typography>
                                    {renderList(structuredAnalysis.risques, 'Aucun signalé')}
                                </Box>

                                {/* Points de vigilance */}
                                {structuredAnalysis.cautions?.length > 0 && (
                                    <Box sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200', borderRadius: '14px', p: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                            <AlertTriangle size={16} color="#d97706" />
                                            <Typography variant="caption" fontWeight={700} color="warning.700">Points de vigilance</Typography>
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            {structuredAnalysis.cautions.map((c, i) => (
                                                <Typography key={i} variant="body2" color="warning.800">• {c}</Typography>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Sources consultées */}
                                {structuredAnalysis.sources_consultees?.length > 0 && (
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                            <Link size={14} />
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">Sources consultées en temps réel</Typography>
                                        </Stack>
                                        <Stack direction="row" flexWrap="wrap" gap={1}>
                                            {structuredAnalysis.sources_consultees.map((src, i) => (
                                                <Chip key={i} label={src} size="small" variant="outlined"
                                                    sx={{ fontSize: '0.7rem', maxWidth: 300,
                                                        ...(src.startsWith('http') ? { cursor: 'pointer', '&:hover': { bgcolor: 'primary.50' } } : {})
                                                    }}
                                                    onClick={src.startsWith('http') ? () => window.open(src, '_blank') : undefined}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* Analyse détaillée narrative */}
                {structuredAnalysis?.analyse_detaillee && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: '28px', border: '1px solid rgba(0, 35, 149, 0.12)', background: 'linear-gradient(135deg, rgba(0,35,149,0.02) 0%, rgba(255,255,255,1) 100%)' }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', flexShrink: 0 }}>
                                    <BookOpen size={22} />
                                </Box>
                                <Box>
                                    <Typography variant="overline" fontWeight={800} color="primary.main" letterSpacing={2}>
                                        Analyse complète
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800}>
                                        Rapport narratif détaillé
                                    </Typography>
                                </Box>
                                <Chip
                                    label="Données temps réel"
                                    size="small"
                                    color="success"
                                    sx={{ ml: 'auto !important', fontWeight: 700 }}
                                />
                            </Stack>
                            <Divider sx={{ mb: 3 }} />
                            <Typography
                                variant="body1"
                                color="text.primary"
                                sx={{
                                    lineHeight: 1.85,
                                    whiteSpace: 'pre-line',
                                    '& p': { mb: 2 }
                                }}
                            >
                                {structuredAnalysis.analyse_detaillee}
                            </Typography>
                        </Paper>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Paper sx={{ p: 4, borderRadius: '28px', border: '1px solid rgba(0, 35, 149, 0.08)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box className="size-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                    <HistoryIcon size={20} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        Historique des analyses
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Rejouez vos précédentes recherches et partagez-les avec votre équipe.
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={loadHistory} disabled={historyLoading}>
                                {historyLoading ? <CircularProgress size={18} /> : <RefreshCcw size={18} />}
                            </IconButton>
                        </Stack>

                        {historyLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                                <CircularProgress size={28} sx={{ color: '#002395' }} />
                            </Box>
                        ) : history.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Aucune analyse sauvegardée pour le moment.
                            </Typography>
                        ) : (
                            <Stack spacing={2.5}>
                                {history.map((entry) => (
                                    <Paper
                                        key={entry.id}
                                        variant="outlined"
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '20px',
                                            borderColor: 'rgba(0, 35, 149, 0.08)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                borderColor: '#002395',
                                                boxShadow: '0 10px 20px -15px rgba(0,35,149,0.5)'
                                            }
                                        }}
                                        onClick={() => handleSelectHistory(entry)}
                                    >
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {entry.commune}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                    {entry.section ? `${entry.section} ${entry.parcelle}` : 'Référence libre'}
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip label={formatDate(entry.created_at)} size="small" variant="outlined" />
                                                <Chip label={entry.response ? 'Analyse disponible' : 'En attente'} color={entry.response ? 'success' : 'default'} size="small" />
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PLUAnalysisPage;
