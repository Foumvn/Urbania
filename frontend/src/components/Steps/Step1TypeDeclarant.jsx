import React from 'react';
import { Box, Typography, Paper, Grid, Fade } from '@mui/material';
import { User, Building2, Check } from 'lucide-react';
import { useForm } from '../../context/FormContext';

function Step1TypeDeclarant() {
    const { data, setField, errors } = useForm();

    const options = [
        {
            value: 'particulier',
            label: 'Particulier',
            description: 'Personne physique (propriétaire, locataire, mandataire...)',
            icon: User,
        },
        {
            value: 'personne_morale',
            label: 'Personne morale',
            description: 'Société, association, syndicat de copropriété, collectivité...',
            icon: Building2,
        },
    ];

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Sélectionnez si vous êtes un particulier ou une personne morale. Cette information est essentielle pour adapter les champs de votre déclaration.
            </Typography>

            <Grid container spacing={4}>
                {options.map((option, index) => {
                    const isSelected = data.typeDeclarant === option.value;
                    const Icon = option.icon;

                    return (
                        <Grid item xs={12} sm={6} key={option.value}>
                            <Fade in style={{ transitionDelay: `${index * 100}ms` }}>
                                <Paper
                                    elevation={0}
                                    onClick={() => setField('typeDeclarant', option.value)}
                                    sx={{
                                        p: 6,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: isSelected ? '#002395' : '#f1f5f9',
                                        borderRadius: '32px',
                                        backgroundColor: isSelected ? 'rgba(0, 35, 149, 0.02)' : 'white',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            borderColor: isSelected ? '#002395' : '#e2e8f0',
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 25px -5px rgba(0, 35, 149, 0.05)',
                                        },
                                    }}
                                >
                                    {/* Selection indicator */}
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 24,
                                                right: 24,
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: '#002395',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 6px -1px rgba(0, 35, 149, 0.3)',
                                            }}
                                        >
                                            <Check size={18} color="white" strokeWidth={3} />
                                        </Box>
                                    )}

                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 4,
                                            backgroundColor: isSelected ? '#002395' : '#f8fafc',
                                            color: isSelected ? 'white' : '#64748b',
                                            transition: 'all 0.4s ease',
                                        }}
                                    >
                                        <Icon size={32} strokeWidth={isSelected ? 2.5 : 1.5} />
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                        color={isSelected ? '#002395' : '#1e293b'}
                                        sx={{ mb: 2, fontSize: '1.25rem' }}
                                    >
                                        {option.label}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.6, fontSize: '0.95rem', opacity: 0.8 }}
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
                    <Box sx={{
                        mt: 4,
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5
                    }}>
                        <Typography color="error" variant="body2" fontWeight={600}>
                            ⚠️ {errors.typeDeclarant}
                        </Typography>
                    </Box>
                </Fade>
            )}
        </Box>
    );
}

export default Step1TypeDeclarant;
