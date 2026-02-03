import { Box, Button, Stack, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function StepNavigation({
    currentStep,
    totalSteps,
    onNext,
    onPrev,
    onSave,
    onGenerate,
    isLastStep,
    isValid
}) {
    return (
        <Box sx={{ mt: 5 }}>
            <Divider sx={{ mb: 4 }} />

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={onPrev}
                    disabled={currentStep === 0}
                    sx={{
                        minWidth: 140,
                        py: 1.5,
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                            borderWidth: 2,
                            bgcolor: 'rgba(30, 58, 95, 0.04)',
                        },
                        '&.Mui-disabled': {
                            borderWidth: 2,
                        },
                    }}
                >
                    Retour
                </Button>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        variant="text"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                        sx={{
                            minWidth: 140,
                            py: 1.5,
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                color: 'primary.main',
                            },
                        }}
                    >
                        Sauvegarder
                    </Button>

                    {isLastStep ? (
                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={onGenerate}
                            disabled={!isValid}
                            sx={{
                                minWidth: 200,
                                py: 1.5,
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                '&:hover': {
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Générer le PDF
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={onNext}
                            sx={{
                                minWidth: 180,
                                py: 1.5,
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                '&:hover': {
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Suivant
                        </Button>

                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

export default StepNavigation;
