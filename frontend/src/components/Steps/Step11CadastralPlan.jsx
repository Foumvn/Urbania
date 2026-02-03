/**
 * Step11CadastralPlan - Étape du plan cadastral avec données réelles cadastre.gouv.fr
 * 
 * Utilise l'API officielle cadastre.data.gouv.fr via le backend Django
 * pour afficher les vraies parcelles cadastrales sur une carte Leaflet.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Alert,
    Divider,
    CircularProgress,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { useForm } from '../../context/FormContext';
import CadastralMap from '../Cadastral/CadastralMap';
import ParcelleSearch from '../Cadastral/ParcelleSearch';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

function Step11CadastralPlan() {
    const { data, setField } = useForm();
    const [parcelles, setParcelles] = useState(null);
    const [batiments, setBatiments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedParcelle, setSelectedParcelle] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(null);

    // Initialize cadastral plan data if not present
    const cadastralPlan = data.cadastralPlan || {
        codeInsee: '',
        section: '',
        numero: '',
        selectedParcelleId: null,
        center: null,
    };

    // Fetch parcelles when codeInsee changes
    const fetchParcelles = useCallback(async (codeInsee) => {
        if (!codeInsee || codeInsee.length < 5) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch parcelles
            const parcellesRes = await fetch(`${API_BASE}/cadastre/parcelles/${codeInsee}/`);
            if (!parcellesRes.ok) {
                throw new Error('Impossible de charger les parcelles');
            }
            const parcellesData = await parcellesRes.json();
            setParcelles(parcellesData);

            // Fetch batiments
            const batimentsRes = await fetch(`${API_BASE}/cadastre/batiments/${codeInsee}/`);
            if (batimentsRes.ok) {
                const batimentsData = await batimentsRes.json();
                setBatiments(batimentsData);
            }
        } catch (err) {
            console.error('Error fetching cadastre data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data if we already have a codeInsee saved
    useEffect(() => {
        if (cadastralPlan.codeInsee) {
            fetchParcelles(cadastralPlan.codeInsee);
        } else {
            setParcelles(null);
            setBatiments(null);
        }
    }, [cadastralPlan.codeInsee, fetchParcelles]);

    // Handler for commune selection
    const handleCommuneSelect = (codeInsee, cityName) => {
        setField('cadastralPlan', {
            ...cadastralPlan,
            codeInsee,
            cityName: cityName || '',
        });
        fetchParcelles(codeInsee);
    };

    // Handler for address selection (from geocoding)
    const handleAddressSelect = (result) => {
        setField('cadastralPlan', {
            ...cadastralPlan,
            codeInsee: result.citycode,
            cityName: result.city,
            address: result.label,
            latitude: result.latitude,
            longitude: result.longitude,
        });
        // Explicitly fetch parcelles for the new city code
        fetchParcelles(result.citycode);
    };

    // Handler for parcelle selection on map
    const handleParcelleClick = (feature) => {
        const props = feature.properties || {};
        const id = props.id || `${props.section}-${props.numero}`;

        setSelectedParcelle({
            id,
            section: props.section,
            numero: props.numero,
            contenance: props.contenance,
            feature,
        });

        setField('cadastralPlan', {
            ...cadastralPlan,
            selectedParcelleId: id,
            section: props.section || '',
            numero: props.numero || '',
            surface: props.contenance || null,
        });
    };

    // Handler for specific parcelle search
    const handleParcelleSelect = (parcelle) => {
        if (parcelle) {
            const props = parcelle.properties || {};
            handleParcelleClick(parcelle);
        }
    };

    // Export handlers
    const handleExportPNG = () => {
        setExportSuccess('Plan cadastral exporté en PNG avec succès !');
        setTimeout(() => setExportSuccess(null), 3000);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <MapIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" fontWeight={600} color="primary.dark">
                    Plan cadastral
                </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Localisez votre parcelle sur le cadastre officiel (cadastre.gouv.fr) et générez votre plan de situation DPC1.
            </Typography>

            {exportSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setExportSuccess(null)}>
                    {exportSuccess}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Search and Selection Row */}
                <Box>
                    <ParcelleSearch
                        onCommuneSelect={handleCommuneSelect}
                        onParcelleSelect={handleParcelleSelect}
                        onAddressSelect={handleAddressSelect}
                        initialCodeInsee={cadastralPlan.codeInsee}
                        initialSection={cadastralPlan.section}
                        initialNumero={cadastralPlan.numero}
                    />

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            {/* Selected Parcelle Info */}
                            {selectedParcelle && (
                                <Paper sx={{ p: 2, height: '100%', bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
                                    <Typography variant="subtitle2" color="primary.main" gutterBottom>
                                        Parcelle sélectionnée
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        Section {selectedParcelle.section} - N° {selectedParcelle.numero}
                                    </Typography>
                                    {selectedParcelle.contenance && (
                                        <Typography variant="body2" color="text.secondary">
                                            Surface : {selectedParcelle.contenance} m²
                                        </Typography>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {/* Instructions */}
                            <Alert severity="info" sx={{ height: '100%', borderRadius: 2 }}>
                                <Typography variant="body2">
                                    <strong>Instructions :</strong>
                                    <br />1. Recherchez votre commune par adresse ou code INSEE
                                    <br />2. Cliquez sur votre parcelle dans la carte
                                    <br />3. Exportez le plan en PNG pour votre dossier
                                </Typography>
                            </Alert>
                        </Grid>
                    </Grid>
                </Box>

                {/* Map Row: Full Width and Larger */}
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Carte cadastrale officielle
                    </Typography>

                    <CadastralMap
                        codeInsee={cadastralPlan.codeInsee}
                        parcelles={parcelles}
                        batiments={batiments}
                        selectedParcelleId={cadastralPlan.selectedParcelleId}
                        onParcelleClick={handleParcelleClick}
                        onExportPNG={handleExportPNG}
                        loading={loading}
                        error={error}
                        height={700}
                        showBatiments={true}
                        showLegend={true}
                    />

                    {parcelles && parcelles.features && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {parcelles.features.length} parcelles chargées • Données : cadastre.data.gouv.fr
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default Step11CadastralPlan;
