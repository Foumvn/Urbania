import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Paper, CircularProgress } from '@mui/material';
import {
    Waves,
    Warehouse,
    Home,
    Fence,
    Trees,
    Layout,
    Hammer,
    Layers,
    MoreHorizontal,
    Sparkles
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

const travauxTypes = [
    { value: 'piscine', label: 'Piscine', icon: Waves },
    { value: 'garage', label: 'Garage / Carport', icon: Warehouse },
    { value: 'hangar', label: 'Hangar', icon: Warehouse },
    { value: 'extension', label: 'Extension', icon: Home },
    { value: 'cloture', label: 'Clôture / Portail', icon: Fence },
    { value: 'abri_jardin', label: 'Abri de jardin', icon: Trees },
    { value: 'veranda', label: 'Véranda', icon: Layout },
    { value: 'terrasse', label: 'Terrasse', icon: Layers },
    { value: 'ravalement', label: 'Ravalement de façade', icon: Hammer },
    { value: 'autre', label: 'Autre', icon: MoreHorizontal },
];

function Step5TypeTravaux() {
    const { data, setField, errors, generateDescriptionWithAI, dispatch } = useForm();
    const [isPreGenerating, setIsPreGenerating] = useState(false);

    const handleChange = (name, value) => {
        setField(name, value);
    };

    // Trigger pre-generation when enough info is present
    useEffect(() => {
        const canPreGenerate = data.typeTravaux &&
            ((data.natureTravaux || []).length > 0) &&
            (!(data.natureTravaux?.includes('autre')) || (data.autreNatureTravaux && data.autreNatureTravaux.length > 3));

        if (canPreGenerate && !data.descriptionProjet && !data.preGeneratedDescription && !isPreGenerating) {
            const triggerPreGeneration = async () => {
                setIsPreGenerating(true);
                try {
                    const desc = await generateDescriptionWithAI(
                        data.typeTravaux,
                        data.natureTravaux,
                        data.autreNatureTravaux
                    );
                    if (desc) {
                        dispatch({ type: 'SET_PRE_GENERATED_DESCRIPTION', value: desc });
                    }
                } finally {
                    setIsPreGenerating(false);
                }
            };

            const timer = setTimeout(triggerPreGeneration, 1000);
            return () => clearTimeout(timer);
        }
    }, [data.typeTravaux, data.natureTravaux, data.autreNatureTravaux, data.descriptionProjet, data.preGeneratedDescription, isPreGenerating, generateDescriptionWithAI, dispatch]);

    const handleNatureToggle = (value) => {
        const current = data.natureTravaux || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        setField('natureTravaux', updated);
        // Clear pre-generated if nature changes much
        if (data.preGeneratedDescription) {
            dispatch({ type: 'SET_PRE_GENERATED_DESCRIPTION', value: '' });
        }
    };

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Décrivez le type de travaux que vous souhaitez réaliser. Cette étape nous permet d'identifier les pièces justificatives nécessaires.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.typeTravaux}>
                        <InputLabel id="type-travaux-label">Type de travaux *</InputLabel>
                        <Select
                            labelId="type-travaux-label"
                            value={data.typeTravaux || ''}
                            label="Type de travaux *"
                            onChange={(e) => handleChange('typeTravaux', e.target.value)}
                            sx={{
                                borderRadius: '16px',
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f1f5f9',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#002395',
                                },
                            }}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="h6" sx={{ color: '#1e293b' }} fontWeight={700}>
                            Nature des éléments *
                        </Typography>
                        {isPreGenerating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={12} color="primary" />
                                <Typography variant="caption" color="primary" fontWeight={600}>
                                    Préparation IA...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Sélectionnez un ou plusieurs éléments concernés par votre projet.
                    </Typography>

                    <Grid container spacing={2}>
                        {travauxTypes.map((type) => {
                            const isSelected = (data.natureTravaux || []).includes(type.value);
                            const Icon = type.icon;
                            return (
                                <Grid item xs={6} sm={4} md={3} key={type.value}>
                                    <Paper
                                        elevation={0}
                                        onClick={() => handleNatureToggle(type.value)}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: isSelected ? '#002395' : '#f1f5f9',
                                            borderRadius: '24px',
                                            backgroundColor: isSelected ? 'rgba(0, 35, 149, 0.02)' : 'white',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: isSelected ? '#002395' : '#e2e8f0',
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 20px -5px rgba(0, 35, 149, 0.05)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2,
                                                backgroundColor: isSelected ? '#002395' : '#f8fafc',
                                                color: isSelected ? 'white' : '#64748b',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <Icon size={24} />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            fontWeight={isSelected ? 700 : 500}
                                            color={isSelected ? '#002395' : '#475569'}
                                        >
                                            {type.label}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>

                {(data.natureTravaux || []).includes('autre') && (
                    <Grid item xs={12}>
                        <FormField
                            label="Précisez la nature des travaux"
                            name="autreNatureTravaux"
                            value={data.autreNatureTravaux}
                            onChange={(name, val) => {
                                handleChange(name, val);
                                if (data.preGeneratedDescription) dispatch({ type: 'SET_PRE_GENERATED_DESCRIPTION', value: '' });
                            }}
                            placeholder="Exemple : pergola, mur de soutènement..."
                            multiline
                            rows={2}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default Step5TypeTravaux;
