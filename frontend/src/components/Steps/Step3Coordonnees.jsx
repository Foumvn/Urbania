import { Box, Typography, Grid, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import { Mail, Phone, MapPin, Navigation } from 'lucide-react';

function Step3Coordonnees() {
    const { data, setField, errors } = useForm();

    const handleChange = (name, value) => {
        setField(name, value);
    };

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Indiquez l'adresse de correspondance pour le suivi de votre dossier.
            </Typography>

            <Grid container spacing={3}>
                {/* Ligne 1: Adresse principale */}
                <Grid item xs={12} sm={2}>
                    <FormField
                        label="Numéro"
                        name="numero"
                        value={data.numero}
                        onChange={handleChange}
                        error={errors.numero}
                        placeholder="12"
                    />
                </Grid>
                <Grid item xs={12} sm={10}>
                    <FormField
                        label="Voie / Rue"
                        name="adresse"
                        value={data.adresse}
                        onChange={handleChange}
                        error={errors.adresse}
                        required
                        placeholder="rue de la République"
                    />
                </Grid>

                {/* Ligne 2: Compléments */}
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Lieu-dit"
                        name="lieuDit"
                        value={data.lieuDit}
                        onChange={handleChange}
                        error={errors.lieuDit}
                        placeholder="Quartier..."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Localité"
                        name="localite"
                        value={data.localite}
                        onChange={handleChange}
                        error={errors.localite}
                        placeholder="Hameau..."
                    />
                </Grid>

                {/* Ligne 3: Ville et CP */}
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={9}>
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

                {/* Ligne 4: BP / Cedex / Pays */}
                <Grid item xs={12} sm={3}>
                    <FormField
                        label="BP"
                        name="bp"
                        value={data.bp}
                        onChange={handleChange}
                        placeholder="Boîte postale"
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <FormField
                        label="Cedex"
                        name="cedex"
                        value={data.cedex}
                        onChange={handleChange}
                        placeholder="CEDEX"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Pays"
                        name="pays"
                        value={data.pays}
                        onChange={handleChange}
                        placeholder="France"
                    />
                </Grid>

                {/* Ligne 5: Contact */}
                <Grid item xs={12} sm={6}>
                    <FormField
                        label="Téléphone"
                        name="telephone"
                        value={data.telephone}
                        onChange={handleChange}
                        error={errors.telephone}
                        placeholder="06 12 34 56 78"
                        startAdornment={<Phone size={16} />}
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
                        startAdornment={<Mail size={16} />}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: 'rgba(0, 35, 149, 0.02)',
                        border: '1px solid rgba(0, 35, 149, 0.05)'
                    }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.acceptEmail || false}
                                    onChange={(e) => handleChange('acceptEmail', e.target.checked)}
                                    sx={{ color: '#002395', '&.Mui-checked': { color: '#002395' } }}
                                />
                            }
                            label={
                                <Typography variant="body2" fontWeight={500}>
                                    J'accepte de recevoir les réponses de l'administration par email
                                </Typography>
                            }
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Step3Coordonnees;
