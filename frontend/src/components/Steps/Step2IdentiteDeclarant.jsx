import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import FormSelect from '../Common/FormSelect';
import { Info } from 'lucide-react';

function Step2IdentiteDeclarant() {
    const { data, setField, errors } = useForm();
    const isParticulier = data.typeDeclarant === 'particulier';

    const handleChange = (name, value) => {
        setField(name, value);
    };

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}>
                {isParticulier
                    ? "Renseignez vos informations personnelles telles qu'elles apparaissent sur votre pièce d'identité."
                    : "Renseignez les informations officielles de votre société ou organisme telles qu'elles figurent sur votre extrait Kbis."
                }
            </Typography>

            <Box sx={{
                mb: 4,
                p: 2.5,
                borderRadius: '16px',
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
                        <FormSelect
                            label="Civilité"
                            name="civilite"
                            value={data.civilite}
                            onChange={handleChange}
                            error={errors.civilite}
                            required
                            options={[
                                { value: 'M.', label: 'M.' },
                                { value: 'Mme', label: 'Mme' }
                            ]}
                        />
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
                        <FormSelect
                            label="Type de société"
                            name="typeSociete"
                            value={data.typeSociete}
                            onChange={handleChange}
                            error={errors.typeSociete}
                            required
                            options={[
                                { value: 'SCI', label: 'SCI - Société Civile Immobilière' },
                                { value: 'SARL', label: 'SARL - Société à Responsabilité Limitée' },
                                { value: 'SAS', label: 'SAS - Société par Actions Simplifiée' },
                                { value: 'SA', label: 'SA - Société Anonyme' },
                                { value: 'Association', label: 'Association (loi 1901)' },
                                { value: 'Copropriete', label: 'Syndicat de copropriété' },
                                { value: 'Autre', label: 'Autre' }
                            ]}
                        />
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
