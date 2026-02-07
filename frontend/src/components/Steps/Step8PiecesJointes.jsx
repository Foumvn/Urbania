import React, { useRef, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    Button,
    IconButton,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Zoom,
    Fade
} from '@mui/material';
import {
    CloudUpload,
    Trash2,
    Eye,
    CheckCircle2,
    Circle,
    FileText,
    Info,
    Camera,
    Sparkles,
    Check,
    X,
    Maximize2
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import { DOCUMENTS_INFO } from '../../config/projectConfigs';

const GeminiLoading = () => (
    <Box sx={{
        width: '100%',
        height: 240,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        overflow: 'hidden',
        position: 'relative'
    }}>
        <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(0,35,149,0.08) 0%, transparent 70%)',
            animation: 'pulse 2s infinite ease-in-out'
        }} />
        <CircularProgress size={28} sx={{ color: '#002395' }} />
        <Typography variant="caption" sx={{ color: '#002395', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            IA Générative en cours...
        </Typography>
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.2); }
            }
        `}} />
    </Box>
);

function Step8PiecesJointes() {
    const { data, setField, projectConfig, generateTechnicalDocument, isGeneratingDP1 } = useForm();
    const [generating, setGenerating] = useState({});
    const [preview, setPreview] = useState({ open: false, url: '', title: '' });
    const fileInputRefs = useRef({});

    const getDocumentFile = (docId) => (data.piecesJointes || {})[docId];

    const handleUpload = (docId) => (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const pieces = { ...(data.piecesJointes || {}) };
                pieces[docId] = reader.result;
                setField('piecesJointes', pieces);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAutoGenerate = async (docId) => {
        setGenerating(prev => ({ ...prev, [docId]: true }));
        try {
            const docData = {
                ...data,
                address: data.terrainAdresse || data.adresse,
                city: data.terrainVille || data.ville,
                cp: data.terrainCodePostal || data.codePostal,
            };

            const objectUrl = await generateTechnicalDocument(docId, docData);
            if (objectUrl) {
                const response = await fetch(objectUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const pieces = { ...(data.piecesJointes || {}) };
                    pieces[docId] = reader.result;
                    setField('piecesJointes', pieces);
                };
                reader.readAsDataURL(blob);
            }
        } finally {
            setGenerating(prev => ({ ...prev, [docId]: false }));
        }
    };

    const handleDelete = (docId) => {
        const pieces = { ...(data.piecesJointes || {}) };
        delete pieces[docId];
        setField('piecesJointes', pieces);
    };

    const isObligatoire = (docId) => projectConfig.requiredDocuments.includes(docId);

    const allDocIds = Object.keys(DOCUMENTS_INFO);
    const dynamicDocuments = allDocIds.map(docId => ({
        id: docId,
        label: DOCUMENTS_INFO[docId].label,
        description: DOCUMENTS_INFO[docId].description,
        obligatoire: isObligatoire(docId),
        canAutoGenerate: docId === 'dp1' || docId === 'dp2'
    }));

    dynamicDocuments.sort((a, b) => (b.obligatoire ? 1 : 0) - (a.obligatoire ? 1 : 0));

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Chargez les documents obligatoires ou laissez l'IA Urbania générer vos plans techniques.
            </Typography>

            <Grid container spacing={4}>
                {dynamicDocuments.map((doc) => {
                    const fileData = getDocumentFile(doc.id);
                    const isRequired = doc.obligatoire;
                    const isGeneratingThis = generating[doc.id];
                    const isDP1Generating = doc.id === 'dp1' && isGeneratingDP1;

                    return (
                        <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    borderRadius: '32px',
                                    border: '1px solid',
                                    borderColor: fileData ? '#059669' : (isRequired ? 'rgba(0, 35, 149, 0.1)' : '#f1f5f9'),
                                    backgroundColor: 'white',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-12px)',
                                        boxShadow: '0 30px 60px -12px rgba(0,35,149,0.15)',
                                        borderColor: '#002395'
                                    }
                                }}
                            >
                                {/* HEADER: Map or Loading or Placeholder */}
                                <Box sx={{ height: 240, position: 'relative', bgcolor: '#f8fafc', overflow: 'hidden' }}>
                                    {isDP1Generating ? (
                                        <GeminiLoading />
                                    ) : fileData ? (
                                        <>
                                            <Box
                                                component="img"
                                                src={fileData}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.5s ease',
                                                    '&:hover': { transform: 'scale(1.05)' }
                                                }}
                                                onClick={() => setPreview({ open: true, url: fileData, title: doc.label })}
                                            />
                                            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(doc.id)}
                                                    sx={{
                                                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                                                        color: 'white',
                                                        '&:hover': { bgcolor: '#ef4444' },
                                                        backdropFilter: 'blur(4px)'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{
                                            height: '100%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', bgcolor: '#f1f5f9', color: '#cbd5e1'
                                        }}>
                                            <FileText size={64} strokeWidth={1.5} />
                                        </Box>
                                    )}

                                    {/* Action Chips */}
                                    <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                                        <Typography variant="caption" sx={{
                                            px: 1.5, py: 0.5, borderRadius: '20px',
                                            bgcolor: isRequired ? 'rgba(0,35,149,0.9)' : 'rgba(100, 116, 139, 0.9)',
                                            color: 'white',
                                            fontWeight: 800,
                                            backdropFilter: 'blur(4px)',
                                            textTransform: 'uppercase',
                                            fontSize: '0.65rem'
                                        }}>
                                            {isRequired ? 'Requis' : 'Optionnel'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 3, flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight={900} color="#002395" sx={{ mb: 0.5, fontSize: '1.2rem' }}>
                                        {doc.id.toUpperCase()}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: '#1e293b', lineHeight: 1.2 }}>
                                        {doc.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        {doc.description}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        hidden
                                        ref={el => fileInputRefs.current[doc.id] = el}
                                        onChange={handleUpload(doc.id)}
                                    />
                                    {!fileData && !isDP1Generating && (
                                        <>
                                            {doc.canAutoGenerate && (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={isGeneratingThis}
                                                    onClick={() => handleAutoGenerate(doc.id)}
                                                    startIcon={isGeneratingThis ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
                                                    sx={{ borderRadius: '14px', bgcolor: '#002395', textTransform: 'none', fontWeight: 800, py: 1.2 }}
                                                >
                                                    Générer
                                                </Button>
                                            )}
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                onClick={() => fileInputRefs.current[doc.id]?.click()}
                                                startIcon={<CloudUpload size={18} />}
                                                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#475569', py: 1.2 }}
                                            >
                                                Joindre
                                            </Button>
                                        </>
                                    )}
                                    {fileData && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircle2 size={18} />}
                                            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, py: 1.2, bgcolor: '#059669' }}
                                            onClick={() => setPreview({ open: true, url: fileData, title: doc.label })}
                                        >
                                            Voir le plan
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Modal de Preview */}
            <Dialog
                open={preview.open}
                onClose={() => setPreview({ ...preview, open: false })}
                maxWidth="md"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{ sx: { borderRadius: '32px', overflow: 'hidden' } }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight={900} color="#002395">{preview.title}</Typography>
                    <IconButton onClick={() => setPreview({ ...preview, open: false })}><X size={24} /></IconButton>
                </Box>
                <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                    <Box
                        component="img"
                        src={preview.url}
                        sx={{
                            width: '100%',
                            display: 'block',
                            maxHeight: '80vh',
                            objectFit: 'contain'
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Step8PiecesJointes;
