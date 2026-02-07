import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Avatar, styled, keyframes } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TranslateIcon from '@mui/icons-material/Translate';
import AssignmentIcon from '@mui/icons-material/Assignment';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const GlassCard = styled(Box)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '12px 16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: `${float} 6s ease-in-out infinite`,
}));

const CarouselContainer = styled(Box)({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
});

const SlideWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
    position: 'absolute',
    inset: 0,
    opacity: active ? 1 : 0,
    transform: active ? 'scale(1)' : 'scale(0.95)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: active ? 'auto' : 'none',
}));

const UrbaniaSlide1 = () => (
    <Box sx={{ position: 'relative', width: '80%', height: '80%', bgcolor: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', p: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ width: '100%', height: 12, bgcolor: '#f1f5f9', borderRadius: 6 }} />
            <Box sx={{ width: '80%', height: 12, bgcolor: '#f1f5f9', borderRadius: 6 }} />
            <Box sx={{ width: '100%', height: 12, bgcolor: '#f8fafc', borderRadius: 6 }} />
            <Box sx={{ width: '60%', height: 12, bgcolor: '#f8fafc', borderRadius: 6 }} />
        </Box>

        <GlassCard sx={{ position: 'absolute', top: '10%', right: '-10%', animationDelay: '0s' }}>
            <Avatar sx={{ bgcolor: 'rgba(88, 61, 161, 0.1)', color: '#583da1' }}>
                <AutoAwesomeIcon />
            </Avatar>
            <Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#583da1', textTransform: 'uppercase' }}>Analyse IA</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Dossier Conforme</Typography>
            </Box>
        </GlassCard>

        <GlassCard sx={{ position: 'absolute', bottom: '20%', left: '-15%', animationDelay: '-2s' }}>
            <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <CheckCircleIcon />
            </Avatar>
            <Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase' }}>Validation</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>CERFA Prêt</Typography>
            </Box>
        </GlassCard>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 100, color: '#583da1', opacity: 0.1 }} />
        </Box>
    </Box>
);

const UrbaniaSlide2 = () => (
    <Box sx={{ position: 'relative', width: '90%', height: '90%' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, height: '100%' }}>
            {[1, 2, 3, 4].map((i) => {
                const labels = ['DP1 - Situation', 'DP2 - Masse', 'DP3 - Coupe', 'DP4 - Façade'];
                return (
                    <Box key={i} sx={{ bgcolor: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ height: '70%', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h1" sx={{ color: '#e2e8f0', fontWeight: 900, fontSize: '3rem', opacity: 0.5 }}>{i}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderTop: '1px solid #f1f5f9' }}>
                            <Box sx={{ h: 6, w: '80%', bgcolor: '#f1f5f9', borderRadius: 3, mb: 1 }} />
                            <Chip label={labels[i - 1]} size="small" sx={{ fontSize: '10px', height: 20 }} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
        <GlassCard sx={{ position: 'absolute', top: '40%', left: '25%', zIndex: 10, animationDelay: '-1s' }}>
            <TranslateIcon sx={{ color: '#583da1' }} />
            <Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#583da1', textTransform: 'uppercase' }}>Extraction</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Données cadastrales</Typography>
            </Box>
        </GlassCard>
    </Box>
);

const UrbaniaSlide3 = () => (
    <Box sx={{ position: 'relative', width: '85%', height: '85%', bgcolor: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
            <Avatar sx={{ bgcolor: '#583da1' }}><AssignmentIcon /></Avatar>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>CERFA 13703*08</Typography>
                <Typography variant="caption" color="text.secondary">Édition en cours...</Typography>
            </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ height: 8, width: '90%', background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: 4 }} />
            <Box sx={{ height: 8, width: '70%', background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: 4 }} />
            <Box sx={{ height: 8, width: '85%', background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: 4 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 4, mt: 'auto' }}>
            <Box sx={{ flex: 1, height: 40, bgcolor: '#f8fafc', borderRadius: 2 }} />
            <Box sx={{ flex: 1, height: 40, bgcolor: '#f8fafc', borderRadius: 2 }} />
        </Box>

        <GlassCard sx={{ position: 'absolute', bottom: '15%', right: '-5%', animationDelay: '-3s' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Prêt à exporter</Typography>
        </GlassCard>
    </Box>
);

const ModernCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % 3);
        }, 2700);
        return () => clearInterval(timer);
    }, []);

    const slides = [
        <UrbaniaSlide1 />,
        <UrbaniaSlide2 />,
        <UrbaniaSlide3 />
    ];

    return (
        <CarouselContainer>
            {slides.map((slide, index) => (
                <SlideWrapper key={index} active={index === activeIndex}>
                    {slide}
                </SlideWrapper>
            ))}

            {/* Pagination dots */}
            <Box sx={{ position: 'absolute', bottom: 20, display: 'flex', gap: 1.5, zIndex: 20 }}>
                {slides.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        sx={{
                            width: index === activeIndex ? 32 : 10,
                            height: 10,
                            borderRadius: 5,
                            bgcolor: index === activeIndex ? '#583da1' : 'rgba(88, 61, 161, 0.2)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </Box>
        </CarouselContainer>
    );
};

export default ModernCarousel;
