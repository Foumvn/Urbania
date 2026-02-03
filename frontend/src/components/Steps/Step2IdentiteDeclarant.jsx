import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider, Alert } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step2IdentiteDeclarant() {
    const { data, setField, errors } = useForm();
    const isParticulier = data.typeDeclarant === 'particulier';

    const handleChange = (name, value) => {
        setField(name, value);
    };

    if (isParticulier) {
        return (
            <Box>
                <Alert
                    severity="info"
                    sx={{
                        mb: 4,
                        borderRadius: 2,
                        '& .MuiAlert-message': { fontSize: '0.875rem' }
                    }}
                >
                    Renseignez vos informations telles qu'elles apparaissent sur votre pièce d'identité.
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth error={!!errors.civilite}>
                            <InputLabel id="civilite-label">Civilité *</InputLabel>
                            <Select
                                labelId="civilite-label"
                                id="civilite"
                                value={data.civilite || ''}
                                label="Civilité *"
                                onChange={(e) => handleChange('civilite', e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="M.">Monsieur</MenuItem>
                                <MenuItem value="Mme">Madame</MenuItem>
                            </Select>
                            {errors.civilite && <FormHelperText error>{errors.civilite}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormField
                            label="Nom de famille"
                            name="nom"
                            value={data.nom}
                            onChange={handleChange}
                            error={errors.nom}
                            required
                            helpTooltip="Nom de famille tel qu'inscrit sur votre pièce d'identité (en majuscules)"
                            placeholder="DUPONT"
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
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
                        <Divider sx={{ my: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Informations complémentaires
                            </Typography>
                        </Divider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Date de naissance"
                            name="dateNaissance"
                            value={data.dateNaissance}
                            onChange={handleChange}
                            error={errors.dateNaissance}
                            placeholder="JJ/MM/AAAA"
                            helpTooltip="Format: jour/mois/année (ex: 15/03/1985)"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormField
                            label="Lieu de naissance"
                            name="lieuNaissance"
                            value={data.lieuNaissance}
                            onChange={handleChange}
                            error={errors.lieuNaissance}
                            placeholder="Paris"
                            helpTooltip="Commune de naissance telle qu'indiquée sur votre pièce d'identité"
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Personne morale
    return (
        <Box>
            <Alert
                severity="info"
                sx={{
                    mb: 4,
                    borderRadius: 2,
                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                }}
            >
                Renseignez les informations officielles de votre société ou organisme.
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Dénomination"
                        name="denomination"
                        value={data.denomination}
                        onChange={handleChange}
                        error={errors.denomination}
                        required
                        helpTooltip="Nom officiel de votre société tel qu'enregistré au RCS"
                        placeholder="SCI Les Oliviers"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Raison sociale"
                        name="raisonSociale"
                        value={data.raisonSociale}
                        onChange={handleChange}
                        error={errors.raisonSociale}
                        helpTooltip="Si différente de la dénomination"
                        showValidIcon={false}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        label="N° SIRET"
                        name="siret"
                        value={data.siret}
                        onChange={handleChange}
                        error={errors.siret}
                        required
                        helpTooltip="Numéro SIRET à 14 chiffres de votre établissement (trouvable sur societe.com ou infogreffe.fr)"
                        placeholder="123 456 789 00012"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.typeSociete}>
                        <InputLabel id="type-societe-label">Type de société</InputLabel>
                        <Select
                            labelId="type-societe-label"
                            value={data.typeSociete || ''}
                            label="Type de société"
                            onChange={(e) => handleChange('typeSociete', e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="SCI">SCI - Société Civile Immobilière</MenuItem>
                            <MenuItem value="SARL">SARL - Société à Responsabilité Limitée</MenuItem>
                            <MenuItem value="SAS">SAS - Société par Actions Simplifiée</MenuItem>
                            <MenuItem value="SA">SA - Société Anonyme</MenuItem>
                            <MenuItem value="EURL">EURL - Entreprise Unipersonnelle</MenuItem>
                            <MenuItem value="EI">Entreprise Individuelle</MenuItem>
                            <MenuItem value="Association">Association (loi 1901)</MenuItem>
                            <MenuItem value="Copropriete">Syndicat de copropriété</MenuItem>
                            <MenuItem value="Collectivite">Collectivité territoriale</MenuItem>
                            <MenuItem value="Autre">Autre</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Représentant légal
                        </Typography>
                    </Divider>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Nom du représentant"
                        name="representantNom"
                        value={data.representantNom}
                        onChange={handleChange}
                        error={errors.representantNom}
                        required
                        placeholder="MARTIN"
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Prénom du représentant"
                        name="representantPrenom"
                        value={data.representantPrenom}
                        onChange={handleChange}
                        error={errors.representantPrenom}
                        required
                        placeholder="Pierre"
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Qualité du représentant"
                        name="representantQualite"
                        value={data.representantQualite}
                        onChange={handleChange}
                        error={errors.representantQualite}
                        helpTooltip="Fonction au sein de la société (Gérant, Président, Directeur...)"
                        placeholder="Gérant"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step2IdentiteDeclarant;
