import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Paper } from '@mui/material';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';
import PoolIcon from '@mui/icons-material/Pool';
import GarageIcon from '@mui/icons-material/Garage';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import FenceIcon from '@mui/icons-material/Fence';
import CabinIcon from '@mui/icons-material/Cabin';
import DeckIcon from '@mui/icons-material/Deck';
import RoofingIcon from '@mui/icons-material/Roofing';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const travauxTypes = [
    { value: 'piscine', label: 'Piscine', icon: <PoolIcon /> },
    { value: 'garage', label: 'Garage / Carport', icon: <GarageIcon /> },
    { value: 'extension', label: 'Extension', icon: <HomeWorkIcon /> },
    { value: 'cloture', label: 'Clôture / Portail', icon: <FenceIcon /> },
    { value: 'abri_jardin', label: 'Abri de jardin', icon: <CabinIcon /> },
    { value: 'veranda', label: 'Véranda', icon: <RoofingIcon /> },
    { value: 'terrasse', label: 'Terrasse', icon: <DeckIcon /> },
    { value: 'ravalement', label: 'Ravalement de façade', icon: <HomeWorkIcon /> },
    { value: 'autre', label: 'Autre', icon: <MoreHorizIcon /> },
];

function Step5TypeTravaux() {
    const { data, setField, errors } = useForm();

    const handleChange = (name, value) => {
        setField(name, value);
    };

    const handleNatureToggle = (value) => {
        const current = data.natureTravaux || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setField('natureTravaux', updated);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} color="primary.dark">
                Nature des travaux
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Décrivez le type de travaux que vous souhaitez réaliser.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.typeTravaux}>
                        <InputLabel id="type-travaux-label">Type de travaux *</InputLabel>
                        <Select
                            labelId="type-travaux-label"
                            value={data.typeTravaux || ''}
                            label="Type de travaux *"
                            onChange={(e) => handleChange('typeTravaux', e.target.value)}
                        >
                            <MenuItem value="construction">Construction nouvelle</MenuItem>
                            <MenuItem value="modification">Modification de l'aspect extérieur</MenuItem>
                            <MenuItem value="amenagement">Aménagement extérieur</MenuItem>
                            <MenuItem value="changement_destination">Changement de destination</MenuItem>
                        </Select>
                        {errors.typeTravaux && <FormHelperText>{errors.typeTravaux}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }} fontWeight={500}>
                        Nature des travaux *
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Sélectionnez un ou plusieurs éléments concernés par votre projet
                    </Typography>

                    <Grid container spacing={2}>
                        {travauxTypes.map((type) => {
                            const isSelected = (data.natureTravaux || []).includes(type.value);
                            return (
                                <Grid item xs={6} sm={4} md={3} key={type.value}>
                                    <Paper
                                        elevation={0}
                                        onClick={() => handleNatureToggle(type.value)}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: 2,
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            borderRadius: 2,
                                            backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: isSelected ? 'primary.main' : 'grey.500',
                                                mb: 1,
                                                '& svg': { fontSize: 32 },
                                            }}
                                        >
                                            {type.icon}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            fontWeight={isSelected ? 600 : 400}
                                            color={isSelected ? 'primary.main' : 'text.secondary'}
                                        >
                                            {type.label}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {errors.natureTravaux && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {errors.natureTravaux}
                        </Typography>
                    )}
                </Grid>

                {(data.natureTravaux || []).includes('autre') && (
                    <Grid item xs={12}>
                        <FormField
                            label="Précisez la nature des travaux"
                            name="autreNatureTravaux"
                            value={data.autreNatureTravaux}
                            onChange={handleChange}
                            placeholder="Décrivez les travaux..."
                            multiline
                            rows={2}
                        />
                    </Grid>
                )}

                {(data.natureTravaux || []).length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {(data.natureTravaux || []).map((value) => {
                                const type = travauxTypes.find(t => t.value === value);
                                return (
                                    <Chip
                                        key={value}
                                        label={type?.label || value}
                                        color="primary"
                                        onDelete={() => handleNatureToggle(value)}
                                        sx={{ fontWeight: 500 }}
                                    />
                                );
                            })}
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default Step5TypeTravaux;
