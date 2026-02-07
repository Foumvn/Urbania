import React from 'react';
import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { Info, User as UserIcon, Building } from 'lucide-react';

function Step2IdentiteDeclarant() {
    const { data, setField, errors } = useForm();
    const isParticulier = data.typeDeclarant === 'particulier';

    const handleChange = (name, value) => {
        setField(name, value);
    };

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                {isParticulier
                    ? "Renseignez vos informations personnelles telles qu'elles apparaissent sur votre pièce d'identité."
                    : "Renseignez les informations officielles de votre société ou organisme telles qu'elles figurent sur votre extrait Kbis."
                }
            </Typography>

            <Box sx={{
                mb: 6,
                p: 3,
                borderRadius: '20px',
                bgcolor: 'rgba(0, 35, 149, 0.03)',
                border: '1px solid rgba(0, 35, 149, 0.08)',
                display: 'flex',
                gap: 2,
                alignItems: 'center'
            }}>
                <Info size={20} color="#002395" />
                <Typography variant="body2" color="#002395" fontWeight={500}>
                    Ces informations seront utilisées pour générer le document CERFA officiel.
                </Typography>
            </Box>

            {isParticulier ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth error={!!errors.civilite}>
                            <InputLabel id="civilite-label">Civilité *</InputLabel>
                            <Select
                                labelId="civilite-label"
                                value={data.civilite || ''}
                                label="Civilité *"
                                onChange={(e) => handleChange('civilite', e.target.value)}
                                sx={{ borderRadius: '16px' }}
                            >
                                <MenuItem value="M.">M.</MenuItem>
                                <MenuItem value="Mme">Mme</MenuItem>
                            </Select>
                            {errors.civilite && <FormHelperText error>{errors.civilite}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                        <FormField
                            label="Nom"
                            name="nom"
                            value={data.nom}
                            onChange={handleChange}
                            error={errors.nom}
                            required
                            placeholder="DUPONT"
                        />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                        <FormField
                            label="Prénom"
                            name="prenom"
                            value={data.prenom}
                            onChange={handleChange}
                            error={errors.prenom}
                            required
                            placeholder="Jean"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 4 }}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', tracking: '0.15em' }}>
                                Naissance
                            </Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                        <FormField
                            label="Date de naissance"
                            name="dateNaissance"
                            value={data.dateNaissance}
                            onChange={handleChange}
                            error={errors.dateNaissance}
                            placeholder="JJ/MM/AAAA"
                        />
                    </Grid>

                    <Grid item xs={12} sm={7}>
                        <FormField
                            label="Lieu de naissance"
                            name="lieuNaissance"
                            value={data.lieuNaissance}
                            onChange={handleChange}
                            error={errors.lieuNaissance}
                            placeholder="Ville de naissance"
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={8}>
                        <FormField
                            label="Dénomination"
                            name="denomination"
                            value={data.denomination}
                            onChange={handleChange}
                            error={errors.denomination}
                            required
                            placeholder="Ex: SCI Les Oliviers"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormField
                            label="N° SIRET"
                            name="siret"
                            value={data.siret}
                            onChange={handleChange}
                            error={errors.siret}
                            required
                            placeholder="14 chiffres"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!errors.typeSociete}>
                            <InputLabel id="type-societe-label">Type de société</InputLabel>
                            <Select
                                labelId="type-societe-label"
                                value={data.typeSociete || ''}
                                label="Type de société"
                                onChange={(e) => handleChange('typeSociete', e.target.value)}
                                sx={{ borderRadius: '16px' }}
                            >
                                <MenuItem value="SCI">SCI - Société Civile Immobilière</MenuItem>
                                <MenuItem value="SARL">SARL - Société à Responsabilité Limitée</MenuItem>
                                <MenuItem value="SAS">SAS - Société par Actions Simplifiée</MenuItem>
                                <MenuItem value="SA">SA - Société Anonyme</MenuItem>
                                <MenuItem value="Association">Association (loi 1901)</MenuItem>
                                <MenuItem value="Copropriete">Syndicat de copropriété</MenuItem>
                                <MenuItem value="Autre">Autre</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 4 }}>
                            <Divider sx={{ flex: 1 }} />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', tracking: '0.15em' }}>
                                Représentant légal
                            </Typography>
                            <Divider sx={{ flex: 1 }} />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormField label="Nom" name="representantNom" value={data.representantNom} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormField label="Prénom" name="representantPrenom" value={data.representantPrenom} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormField label="Fonction" name="representantQualite" value={data.representantQualite} onChange={handleChange} placeholder="Gérant..." />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default Step2IdentiteDeclarant;
