import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Grid, Divider, Checkbox, FormControlLabel, Button, Alert, useTheme, Paper, Fade, CircularProgress, Chip } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import ParcelleSearch from '../Cadastral/ParcelleSearch';
import CadastralMap from '../Cadastral/CadastralMap';
import MapIcon from '@mui/icons-material/Map';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

function Step4Terrain() {
    const theme = useTheme();
    const { data, setField, setMultipleFields, errors } = useForm();
    const [sameAddress, setSameAddress] = useState(false);

    // États pour la cartographie
    const [parcellesData, setParcellesData] = useState(null);
    const [batimentsData, setBatimentsData] = useState(null);
    const [loadingMap, setLoadingMap] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [isGeneratingDP1, setIsGeneratingDP1] = useState(false);
    const [dp1Generated, setDp1Generated] = useState(!!data.piecesJointes?.dp1);

    const mapRef = useRef(null);

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleSameAddress = (event) => {
        const checked = event.target.checked;
        setSameAddress(checked);
        if (checked) {
            setMultipleFields({
                terrainNumero: data.numero,
                terrainAdresse: data.adresse,
                terrainLieuDit: data.lieuDit,
                terrainCodePostal: data.codePostal,
                terrainVille: data.ville
            });
        }
    };

    // Charger les données de la commune
    const loadCommuneData = useCallback(async (codeInsee) => {
        if (!codeInsee || codeInsee.length !== 5) return;

        setLoadingMap(true);
        setMapError(null);
        try {
            const [pRes, bRes] = await Promise.all([
                fetch(`${API_BASE}/cadastre/parcelles/${codeInsee}/`),
                fetch(`${API_BASE}/cadastre/batiments/${codeInsee}/`)
            ]);

            if (!pRes.ok) throw new Error('Erreur lors du chargement des parcelles');

            const pData = await pRes.json();
            const bData = bRes.ok ? await bRes.json() : { type: 'FeatureCollection', features: [] };

            setParcellesData(pData);
            setBatimentsData(bData);
            setShowMap(true);
        } catch (err) {
            console.error('Map loading error:', err);
            setMapError('Impossible de charger le plan cadastral de cette commune.');
        } finally {
            setLoadingMap(false);
        }
    }, []);

    // Lors de la sélection d'une adresse/commune via la recherche
    const handleAddressSelect = (result) => {
        setMultipleFields({
            terrainAdresse: result.street || result.label,
            terrainNumero: result.housenumber || '',
            terrainCodePostal: result.postcode,
            terrainVille: result.city,
            terrainCodeInsee: result.citycode
        });
        loadCommuneData(result.citycode);
    };

    // Lors du clic sur une parcelle dans la carte
    const handleParcelleClick = (feature) => {
        const props = feature.properties || {};
        setMultipleFields({
            prefixe: props.prefixe || '000',
            section: props.section,
            numeroParcelle: props.numero,
            surfaceTerrain: props.contenance || '',
            selectedParcelleId: props.id || `${props.section}-${props.numero}`,
            surfaceTotale: props.contenance || ''
        });
    };

    // Génération automatique du DP1 via capture de la carte
    const handleGenerateDP1 = async () => {
        setIsGeneratingDP1(true);

        // Simuler un léger délai pour l'UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Utiliser la fonction d'export du composant CadastralMap s'il est accessible 
            // ou capturer directement si on a accès au DOM
            const mapContainer = document.querySelector('.leaflet-container');
            if (!mapContainer) throw new Error("Carte non trouvée");

            // Importer html2canvas dynamiquement pour éviter les soucis de bundle si non utilisé
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(mapContainer, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
            });

            const base64Image = canvas.toDataURL('image/png');

            // Sauvegarder dans les pièces jointes
            const updatedPieces = { ...data.piecesJointes, dp1: base64Image };
            setField('piecesJointes', updatedPieces);
            setDp1Generated(true);

        } catch (error) {
            console.error("Erreur génération DP1:", error);
            alert("Erreur lors de la génération du DP1. Veuillez réessayer.");
        } finally {
            setIsGeneratingDP1(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Le terrain concerné
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Localisation et références cadastrales du terrain où seront réalisés les travaux.
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
                {/* Recherche et Localisation */}
                <Grid item xs={12} lg={5}>
                    <Paper elevation={0} sx={{ p: 0, border: 'none', bgcolor: 'transparent' }}>
                        <ParcelleSearch
                            onAddressSelect={handleAddressSelect}
                            onCommuneSelect={(code) => loadCommuneData(code)}
                            initialCodeInsee={data.terrainCodeInsee}
                        />

                        <Box sx={{ mt: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={sameAddress}
                                        onChange={handleSameAddress}
                                        color="primary"
                                    />
                                }
                                label="Même adresse que mes coordonnées"
                                sx={{ mb: 2 }}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <FormField
                                        label="Numéro"
                                        name="terrainNumero"
                                        value={data.terrainNumero}
                                        onChange={handleChange}
                                        disabled={sameAddress}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <FormField
                                        label="Voie / Rue"
                                        name="terrainAdresse"
                                        value={data.terrainAdresse}
                                        onChange={handleChange}
                                        required
                                        disabled={sameAddress}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormField
                                        label="CP"
                                        name="terrainCodePostal"
                                        value={data.terrainCodePostal}
                                        onChange={handleChange}
                                        required
                                        disabled={sameAddress}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <FormField
                                        label="Ville"
                                        name="terrainVille"
                                        value={data.terrainVille}
                                        onChange={handleChange}
                                        required
                                        disabled={sameAddress}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* Carte et Réf Cadastrales */}
                <Grid item xs={12} lg={7}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {loadingMap ? (
                            <Paper elevation={0} sx={{
                                height: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 3,
                                bgcolor: '#f8fafc'
                            }}>
                                <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
                                <Typography color="text.secondary">Récupération du plan cadastral...</Typography>
                            </Paper>
                        ) : showMap ? (
                            <Fade in={true}>
                                <Box>
                                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MapIcon color="primary" fontSize="small" />
                                            Sélectionnez votre parcelle sur la carte
                                        </Typography>
                                        {data.numeroParcelle && (
                                            <Chip
                                                label={`Parcelle ${data.section} ${data.numeroParcelle}`}
                                                color="primary"
                                                size="small"
                                                onDelete={() => setMultipleFields({ section: '', numeroParcelle: '', surfaceTerrain: '', selectedParcelleId: null })}
                                            />
                                        )}
                                    </Box>
                                    <CadastralMap
                                        height={400}
                                        codeInsee={data.terrainCodeInsee}
                                        parcelles={parcellesData}
                                        batiments={batimentsData}
                                        selectedParcelleId={data.selectedParcelleId}
                                        onParcelleClick={handleParcelleClick}
                                    />
                                </Box>
                            </Fade>
                        ) : (
                            <Paper elevation={0} sx={{
                                height: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 3,
                                bgcolor: '#f8fafc',
                                textAlign: 'center',
                                p: 4
                            }}>
                                <MapIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Plan Cadastral Interactif
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Recherchez une adresse pour afficher la carte et identifier automatiquement votre terrain.
                                </Typography>
                            </Paper>
                        )}

                        {mapError && <Alert severity="warning" sx={{ mt: 2 }}>{mapError}</Alert>}

                        <Paper elevation={0} sx={{ p: 3, mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#f1f5f9' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <AutoFixHighIcon color="secondary" fontSize="small" />
                                <Typography variant="subtitle2" fontWeight={700}>Références automatiquement remplies</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <FormField label="Préfixe" name="prefixe" value={data.prefixe} onChange={handleChange} placeholder="000" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormField label="Section" name="section" value={data.section} onChange={handleChange} required placeholder="AB" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormField label="N°" name="numeroParcelle" value={data.numeroParcelle} onChange={handleChange} required placeholder="124" />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormField label="Surface (m²)" name="surfaceTerrain" value={data.surfaceTerrain} onChange={handleChange} type="number" endAdornment="m²" />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Génération DP1 */}
            {data.numeroParcelle && (
                <Fade in={true}>
                    <Box sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: dp1Generated ? 'success.light' : 'primary.light',
                        borderRadius: 3,
                        bgcolor: dp1Generated ? 'success.50' : 'primary.50',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2
                    }}>
                        <Box>
                            <Typography variant="h6" color={dp1Generated ? "success.dark" : "primary.dark"} fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {dp1Generated && <CheckCircleOutlineIcon />}
                                {dp1Generated ? "Plan de Situation (DP1) enregistré !" : "Prêt pour votre DP1 ?"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dp1Generated
                                    ? "Votre plan a été généré avec succès et ajouté aux pièces jointes de votre dossier."
                                    : "Nous pouvons générer automatiquement votre **Plan de Situation (DP1)** à partir de la carte ci-dessus."
                                }
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            disabled={isGeneratingDP1}
                            startIcon={isGeneratingDP1 ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                background: dp1Generated
                                    ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
                                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                boxShadow: dp1Generated
                                    ? '0 4px 12px rgba(46, 125, 50, 0.3)'
                                    : '0 4px 12px rgba(25, 118, 210, 0.3)'
                            }}
                            onClick={handleGenerateDP1}
                        >
                            {isGeneratingDP1 ? "Génération..." : dp1Generated ? "Régénérer le DP1" : "Générer le DP1"}
                        </Button>
                    </Box>
                </Fade>
            )}
        </Box>
    );
}

export default Step4Terrain;
