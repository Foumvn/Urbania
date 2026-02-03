import { Box, LinearProgress, Typography, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const steps = [
    { label: 'Qualité', short: '1' },
    { label: 'Identité', short: '2' },
    { label: 'Coordonnées', short: '3' },
    { label: 'Terrain', short: '4' },
    { label: 'Travaux', short: '5' },
    { label: 'Description', short: '6' },
    { label: 'Surfaces', short: '7' },
    { label: 'Pièces', short: '8' },
    { label: 'Engagements', short: '9' },
    { label: 'Récapitulatif', short: '10' },
];

function ProgressBar({ currentStep, onStepClick }) {
    const progress = (currentStep / (steps.length - 1)) * 100;

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    Étape {currentStep + 1} sur {steps.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {Math.round(progress)}% complété
                </Typography>
            </Box>

            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    mb: 3,
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #0d47a1 0%, #5472d3 100%)',
                    },
                }}
            />

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: 'center',
                }}
            >
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <Chip
                            key={index}
                            label={step.label}
                            size="small"
                            icon={isCompleted ? <CheckCircleIcon fontSize="small" /> : undefined}
                            onClick={() => onStepClick && onStepClick(index)}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                ...(isCurrent && {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }),
                                ...(isCompleted && {
                                    backgroundColor: 'success.light',
                                    color: 'white',
                                    '& .MuiChip-icon': {
                                        color: 'white',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'success.main',
                                    },
                                }),
                                ...(!isCurrent && !isCompleted && {
                                    backgroundColor: 'grey.100',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: 'grey.200',
                                    },
                                }),
                            }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
}

export default ProgressBar;
