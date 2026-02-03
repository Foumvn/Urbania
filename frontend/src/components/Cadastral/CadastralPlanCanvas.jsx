import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Button, Stack, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { drawCadastralPlan, downloadAsPNG, generateCadastralPDF } from '../../utils/cadastralPlanGenerator';

function CadastralPlanCanvas({ data, onExport }) {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 600 * zoom;
            canvas.height = 450 * zoom;

            const ctx = canvas.getContext('2d');
            ctx.scale(zoom, zoom);

            drawCadastralPlan(canvas, data);
        }
    }, [data, zoom]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleRefresh = () => {
        if (canvasRef.current) {
            drawCadastralPlan(canvasRef.current, data);
        }
    };

    const handleDownloadPNG = () => {
        if (canvasRef.current) {
            downloadAsPNG(canvasRef.current, `plan_cadastral_${data.numeroParcelle || 'parcelle'}.png`);
            if (onExport) onExport('png');
        }
    };

    const handleDownloadPDF = async () => {
        if (canvasRef.current) {
            setIsGenerating(true);
            try {
                await generateCadastralPDF(canvasRef.current, data);
                if (onExport) onExport('pdf');
            } catch (error) {
                console.error('Erreur génération PDF:', error);
            } finally {
                setIsGenerating(false);
            }
        }
    };

    return (
        <Box>
            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                        Aperçu du plan cadastral
                    </Typography>
                    <Tooltip title="Actualiser">
                        <IconButton size="small" onClick={handleRefresh}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Zoom arrière">
                        <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                            <ZoomOutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {Math.round(zoom * 100)}%
                    </Typography>
                    <Tooltip title="Zoom avant">
                        <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 2}>
                            <ZoomInIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPNG}
                    >
                        PNG
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        sx={{
                            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        }}
                    >
                        {isGenerating ? 'Génération...' : 'PDF'}
                    </Button>
                </Stack>
            </Paper>

            {/* Canvas Container */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'auto',
                    maxHeight: 500,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#f5f5f5'
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: 'white',
                    }}
                />
            </Paper>

            {/* Legend */}
            <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: '#FF8A65', border: '1px solid #333', borderRadius: 0.5 }} />
                    <Typography variant="caption">Parcelle concernée</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: '#FFD54F', border: '1px solid #333', borderRadius: 0.5 }} />
                    <Typography variant="caption">Parcelles voisines</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 16, height: 16, bgcolor: '#FFA726', border: '1px solid #333', borderRadius: 0.5 }} />
                    <Typography variant="caption">Construction projetée</Typography>
                </Stack>
            </Box>
        </Box>
    );
}

export default CadastralPlanCanvas;
