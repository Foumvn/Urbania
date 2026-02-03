import { Box, Typography, Paper, Grid, Fade } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from '../../context/FormContext';

function Step1TypeDeclarant() {
    const { data, setField, errors } = useForm();

    const options = [
        {
            value: 'particulier',
            label: 'Particulier',
            description: 'Personne physique (propriétaire, locataire, mandataire...)',
            icon: <PersonIcon sx={{ fontSize: 40 }} />,
        },
        {
            value: 'personne_morale',
            label: 'Personne morale',
            description: 'Société, association, syndicat de copropriété, collectivité...',
            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
        },
    ];

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Cette information est essentielle pour adapter les champs de votre déclaration.
                Sélectionnez votre qualité ci-dessous.
            </Typography>

            <Grid container spacing={3}>
                {options.map((option, index) => {
                    const isSelected = data.typeDeclarant === option.value;

                    return (
                        <Grid item xs={12} sm={6} key={option.value}>
                            <Fade in style={{ transitionDelay: `${index * 100}ms` }}>
                                <Paper
                                    elevation={0}
                                    onClick={() => setField('typeDeclarant', option.value)}
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: 2,
                                        borderColor: isSelected ? 'secondary.main' : 'divider',
                                        borderRadius: 3,
                                        backgroundColor: isSelected ? 'rgba(230, 126, 34, 0.04)' : 'background.paper',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            borderColor: isSelected ? 'secondary.main' : 'primary.main',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 28px rgba(30, 58, 95, 0.12)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {/* Selection indicator */}
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                right: 16,
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: 'secondary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                    )}

                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2.5,
                                            backgroundColor: isSelected ? 'secondary.main' : 'action.hover',
                                            color: isSelected ? 'white' : 'text.secondary',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {option.icon}
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        color={isSelected ? 'secondary.main' : 'text.primary'}
                                        gutterBottom
                                    >
                                        {option.label}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.6 }}
                                    >
                                        {option.description}
                                    </Typography>
                                </Paper>
                            </Fade>
                        </Grid>
                    );
                })}
            </Grid>

            {errors.typeDeclarant && (
                <Fade in>
                    <Typography
                        color="error"
                        variant="body2"
                        sx={{
                            mt: 3,
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                        }}
                    >
                        ⚠️ {errors.typeDeclarant}
                    </Typography>
                </Fade>
            )}
        </Box>
    );
}

export default Step1TypeDeclarant;
