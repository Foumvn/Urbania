/**
 * ParcelleSearch - Composant de recherche de parcelles cadastrales
 * 
 * Permet de rechercher par:
 * - Code INSEE de la commune
 * - Adresse (géocodage)
 * - Section et numéro de parcelle
 */

import { useState, useCallback } from 'react';
import {
    Box, TextField, Button, Paper, Typography, CircularProgress,
    List, ListItem, ListItemButton, ListItemText, ListItemIcon,
    Autocomplete, Grid, Chip, Alert, InputAdornment, IconButton,
    ToggleButton, ToggleButtonGroup, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import ClearIcon from '@mui/icons-material/Clear';
import GridOnIcon from '@mui/icons-material/GridOn';
import debounce from 'lodash.debounce';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

export default function ParcelleSearch({
    onCommuneSelect,
    onParcelleSelect,
    onAddressSelect,
    initialCodeInsee = '',
    initialSection = '',
    initialNumero = '',
}) {
    const [searchMode, setSearchMode] = useState('address'); // 'address' | 'insee'
    const [address, setAddress] = useState('');
    const [codeInsee, setCodeInsee] = useState(initialCodeInsee);
    const [section, setSection] = useState(initialSection);
    const [numero, setNumero] = useState(initialNumero);

    const [addressResults, setAddressResults] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Géocodage d'adresse (debounced)
    const searchAddress = useCallback(
        debounce(async (query) => {
            if (!query || query.length < 3) {
                setAddressResults([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE}/cadastre/geocode/?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Erreur de géocodage');

                const data = await response.json();
                setAddressResults(data.results || []);
            } catch (err) {
                setError('Impossible de rechercher l\'adresse');
                setAddressResults([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Récupérer les sections d'une commune
    const fetchSections = async (insee) => {
        if (!insee || insee.length < 5) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/cadastre/sections/${insee}/`);
            if (!response.ok) throw new Error('Erreur sections');

            const data = await response.json();
            setSections(data.sections || []);
        } catch (err) {
            console.error('Error fetching sections:', err);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    // Handler sélection d'adresse
    const handleAddressSelect = (result) => {
        setSelectedAddress(result);
        setCodeInsee(result.citycode);
        setAddress(result.label);
        setAddressResults([]);

        // Charger les sections
        fetchSections(result.citycode);

        if (onAddressSelect) {
            onAddressSelect(result);
        }
        if (onCommuneSelect) {
            onCommuneSelect(result.citycode, result.city);
        }
    };

    // Handler recherche par code INSEE
    const handleInseeSearch = () => {
        if (!codeInsee || codeInsee.length !== 5) {
            setError('Le code INSEE doit contenir 5 chiffres');
            return;
        }

        setError(null);
        fetchSections(codeInsee);

        if (onCommuneSelect) {
            onCommuneSelect(codeInsee);
        }
    };

    // Handler recherche de parcelle spécifique
    const handleParcelleSearch = async () => {
        if (!codeInsee || !section || !numero) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Formatage du numéro sur 4 chiffres (ex: 123 -> 0123)
            const formattedNumero = numero.padStart(4, '0');
            const response = await fetch(
                `${API_BASE}/cadastre/parcelle/${codeInsee}/${section}/${formattedNumero}/`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Parcelle ${section} ${formattedNumero} non trouvée dans la commune ${codeInsee}`);
                }
                throw new Error('Erreur de recherche (APICarto indisponible ou paramètres invalides)');
            }

            const parcelle = await response.json();

            if (onParcelleSelect) {
                onParcelleSelect(parcelle);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setSearchMode(newMode);
            setError(null);
        }
    };

    // Reset
    const handleClear = () => {
        setAddress('');
        setCodeInsee('');
        setSection('');
        setNumero('');
        setAddressResults([]);
        setSections([]);
        setSelectedAddress(null);
        setError(null);
    };

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <SearchIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                    Rechercher une parcelle
                </Typography>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Mode Selection */}
            <ToggleButtonGroup
                value={searchMode}
                exclusive
                onChange={handleModeChange}
                fullWidth
                size="small"
                sx={{ mb: 3, bgcolor: '#f8fafc' }}
            >
                <ToggleButton value="address" sx={{ py: 1, gap: 1 }}>
                    <LocationOnIcon fontSize="small" />
                    Par adresse
                </ToggleButton>
                <ToggleButton value="insee" sx={{ py: 1, gap: 1 }}>
                    <MapIcon fontSize="small" />
                    Par code INSEE
                </ToggleButton>
            </ToggleButtonGroup>

            {/* Content based on mode */}
            <Box sx={{ mb: 2 }}>
                {searchMode === 'address' ? (
                    <Box>
                        <TextField
                            fullWidth
                            label="Adresse du terrain"
                            placeholder="Ex: 15 rue de la Paix, Paris"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                searchAddress(e.target.value);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: loading && (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {addressResults.length > 0 && (
                            <Paper sx={{ mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 250, overflow: 'auto', zIndex: 10 }}>
                                <List dense>
                                    {addressResults.map((result, index) => (
                                        <ListItemButton
                                            key={index}
                                            onClick={() => handleAddressSelect(result)}
                                            divider={index < addressResults.length - 1}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <LocationOnIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={result.label}
                                                secondary={`Code INSEE: ${result.citycode} - ${result.postcode}`}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            flex={1}
                            fullWidth
                            label="Code INSEE de la commune"
                            placeholder="Ex: 75056"
                            value={codeInsee}
                            onChange={(e) => setCodeInsee(e.target.value.replace(/\D/g, '').slice(0, 5))}
                            inputProps={{ maxLength: 5 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleInseeSearch}
                            disabled={loading || codeInsee.length !== 5}
                            sx={{ minWidth: 120, borderRadius: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Rechercher'}
                        </Button>
                    </Box>
                )}
            </Box>

            {selectedAddress && searchMode === 'address' && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>{selectedAddress.city}</strong> sélectionnée (INSEE: {selectedAddress.citycode})
                </Alert>
            )}

            {/* Advanced Search: Section & Number */}
            {(sections.length > 0 || codeInsee.length === 5) && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <GridOnIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                            Affiner par section et numéro de parcelle
                        </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            {sections.length > 0 ? (
                                <Autocomplete
                                    options={sections}
                                    value={section}
                                    onChange={(e, value) => setSection(value || '')}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Section" placeholder="Ex: AB" />
                                    )}
                                />
                            ) : (
                                <TextField
                                    fullWidth
                                    label="Section"
                                    placeholder="Ex: AB"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                                    inputProps={{ maxLength: 2 }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Numéro"
                                placeholder="Ex: 0123"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                inputProps={{ maxLength: 4 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                onClick={handleParcelleSearch}
                                disabled={loading || !section || !numero}
                                sx={{ height: '100%', borderRadius: 2, minHeight: 56 }}
                            >
                                Localiser la parcelle
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Reset Button */}
            {(address || codeInsee || section || numero) && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        startIcon={<ClearIcon />}
                        onClick={handleClear}
                        size="small"
                        color="inherit"
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                        Réinitialiser la recherche
                    </Button>
                </Box>
            )}
        </Paper>
    );
}
