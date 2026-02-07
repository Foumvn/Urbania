import React, { useState } from 'react';
import { Box, Typography, Grid, Divider, Checkbox, FormControlLabel, Paper, Fade } from '@mui/material';
import {
    MapPin,
    Hash,
    Building2,
    Navigation,
    Search,
    CheckCircle2,
    Info,
    Move
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step4Terrain() {
    const { data, setField, setMultipleFields, errors } = useForm();
    const [sameAddress, setSameAddress] = useState(false);

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

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Localisation et références cadastrales du terrain où seront réalisés les travaux.
            </Typography>

            <Grid container spacing={4}>
                {/* Section Adresse */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            bgcolor: 'white',
                            height: '100%'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <MapPin size={22} color="#002395" />
                            <Typography variant="h6" fontWeight={700} color="#1e293b">
                                Adresse du terrain
                            </Typography>
                        </Box>

                        <Box sx={{
                            mb: 4,
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: sameAddress ? 'rgba(0, 35, 149, 0.05)' : '#f8fafc',
                            border: '1px solid',
                            borderColor: sameAddress ? 'rgba(0, 35, 149, 0.1)' : '#f1f5f9',
                            transition: 'all 0.2s ease'
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={sameAddress}
                                        onChange={handleSameAddress}
                                        sx={{
                                            color: '#002395',
                                            '&.Mui-checked': { color: '#002395' }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={600} color="#002395">
                                        Même adresse que mes coordonnées
                                    </Typography>
                                }
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                                <FormField
                                    label="Numéro"
                                    name="terrainNumero"
                                    value={data.terrainNumero}
                                    onChange={handleChange}
                                    error={errors.terrainNumero}
                                    disabled={sameAddress}
                                    placeholder="12"
                                />
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <FormField
                                    label="Voie / Rue"
                                    name="terrainAdresse"
                                    value={data.terrainAdresse}
                                    onChange={handleChange}
                                    error={errors.terrainAdresse}
                                    required
                                    disabled={sameAddress}
                                    placeholder="Rue de la Liberté"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormField
                                    label="CP"
                                    name="terrainCodePostal"
                                    value={data.terrainCodePostal}
                                    onChange={handleChange}
                                    error={errors.terrainCodePostal}
                                    required
                                    disabled={sameAddress}
                                    placeholder="75001"
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <FormField
                                    label="Ville"
                                    name="terrainVille"
                                    value={data.terrainVille}
                                    onChange={handleChange}
                                    error={errors.terrainVille}
                                    required
                                    disabled={sameAddress}
                                    placeholder="Paris"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Section Cadastre */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1px solid rgba(0, 35, 149, 0.1)',
                            bgcolor: 'rgba(0, 35, 149, 0.02)',
                            height: '100%'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Building2 size={22} color="#002395" />
                            <Typography variant="h6" fontWeight={700} color="#1e293b">
                                Références cadastrales
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <FormField
                                    label="Préfixe"
                                    name="prefixe"
                                    value={data.prefixe}
                                    onChange={handleChange}
                                    error={errors.prefixe || errors.referenceCadastrale}
                                    placeholder="000"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormField
                                    label="Section"
                                    name="section"
                                    value={data.section}
                                    onChange={handleChange}
                                    error={errors.section || errors.referenceCadastrale}
                                    required
                                    placeholder="AB"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormField
                                    label="N° Parcelle"
                                    name="numeroParcelle"
                                    value={data.numeroParcelle}
                                    onChange={handleChange}
                                    error={errors.numeroParcelle || errors.referenceCadastrale}
                                    required
                                    placeholder="1242"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormField
                                    label="Surface du terrain"
                                    name="surfaceTerrain"
                                    value={data.surfaceTerrain}
                                    onChange={handleChange}
                                    error={errors.surfaceTerrain}
                                    type="number"
                                    endAdornment="m²"
                                    placeholder="234"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            mt: 4,
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: 'white',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center'
                        }}>
                            <Info size={18} color="#64748b" />
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                                Ces informations figurent sur votre titre de propriété ou sur <strong>cadastre.gouv.fr</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step4Terrain;
