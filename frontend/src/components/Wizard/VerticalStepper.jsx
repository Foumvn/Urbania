import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useI18n } from '../../context/I18nContext';

function VerticalStepper({ currentStep, steps, onStepClick }) {
    const { t } = useI18n();

    return (
        <Box sx={{ py: 2 }}>
            <Typography
                variant="overline"
                sx={{
                    px: 3,
                    py: 1,
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.1em'
                }}
            >
                Étapes du dossier
            </Typography>

            <Box sx={{ mt: 1 }}>
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isDisabled = index > currentStep && !isCompleted;

                    return (
                        <Box
                            key={index}
                            onClick={() => !isDisabled && onStepClick(index)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 3,
                                py: 1.5,
                                cursor: isDisabled ? 'default' : 'pointer',
                                bgcolor: isActive ? 'primary.50' : 'transparent',
                                color: isActive ? 'primary.main' : (isCompleted ? 'success.main' : 'text.primary'),
                                borderRight: isActive ? '4px solid' : 'none',
                                borderColor: 'primary.main',
                                transition: 'all 0.2s',
                                opacity: isDisabled ? 0.4 : 1,
                                '&:hover': {
                                    bgcolor: isDisabled ? 'transparent' : (isActive ? 'primary.50' : 'rgba(0, 0, 0, 0.03)'),
                                }
                            }}
                        >
                            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isCompleted ? (
                                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                                ) : (
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        border: '2px solid',
                                        borderColor: isActive ? 'primary.main' : 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        bgcolor: isActive ? 'primary.main' : 'transparent',
                                        color: isActive ? 'white' : 'text.secondary'
                                    }}>
                                        {index + 1}
                                    </Box>
                                )}
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? 700 : 500,
                                    lineHeight: 1.2
                                }}>
                                    {t(step.title)}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default VerticalStepper;
