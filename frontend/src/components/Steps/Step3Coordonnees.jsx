import { Box, Typography, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step3Coordonnees() {
    const { data, setField, errors } = useForm();

    const handleChange = (name, value) => {
        setField(name, value);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Vos coordonnées
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Adresse à laquelle vous souhaitez recevoir les courriers relatifs à votre déclaration.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                    <FormField
                        label="Numéro"
                        name="numero"
                        value={data.numero}
                        onChange={handleChange}
                        error={errors.numero}
                        placeholder="12"
                    />
                </Grid>
                <Grid item xs={12} sm={9}>
                    <FormField
                        label="Voie / Rue"
                        name="adresse"
                        value={data.adresse}
                        onChange={handleChange}
                        error={errors.adresse}
                        required
                        helpTooltip="Nom de la rue, avenue, etc."
                        placeholder="rue de la République"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Lieu-dit"
                        name="lieuDit"
                        value={data.lieuDit}
                        onChange={handleChange}
                        placeholder="Quartier..."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Localité"
                        name="localite"
                        value={data.localite}
                        onChange={handleChange}
                        placeholder="Hameau..."
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Code postal"
                        name="codePostal"
                        value={data.codePostal}
                        onChange={handleChange}
                        error={errors.codePostal}
                        required
                        placeholder="75001"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormField
                        label="BP"
                        name="bp"
                        value={data.bp}
                        onChange={handleChange}
                        placeholder="Boîte postale"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Cedex"
                        name="cedex"
                        value={data.cedex}
                        onChange={handleChange}
                        placeholder="CEDEX"
                    />
                </Grid>

                <Grid item xs={12} sm={8}>
                    <FormField
                        label="Ville"
                        name="ville"
                        value={data.ville}
                        onChange={handleChange}
                        error={errors.ville}
                        required
                        placeholder="Paris"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormField
                        label="Pays"
                        name="pays"
                        value={data.pays}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Téléphone"
                        name="telephone"
                        value={data.telephone}
                        onChange={handleChange}
                        error={errors.telephone}
                        placeholder="06 12 34 56 78"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        type="email"
                        placeholder="jean.dupont@email.fr"
                    />
                </Grid>

                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={data.acceptEmail || false}
                                onChange={(e) => handleChange('acceptEmail', e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                J'accepte de recevoir les réponses de l'administration par email
                            </Typography>
                        }
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step3Coordonnees;
