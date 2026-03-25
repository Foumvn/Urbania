import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    Maximize2,
    GripVertical,
    PlusCircle,
    AlertCircle,
    UploadCloud,
    Layout
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import { DOCUMENTS_INFO } from '../../config/projectConfigs';

// Dnd Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const SortableDocumentCard = ({
    doc,
    fileData,
    isRequired,
    isGeneratingThis,
    isMapGenerating,
    handleDelete,
    handleUpload,
    handleAutoGenerate,
    setPreview,
    fileInputRefs
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: doc.id });

    const [isDragOver, setIsDragOver] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const isMissing = isRequired && !fileData && !isMapGenerating;
    const isCompleted = !!fileData;

    return (
        <Grid item xs={12} sm={6} lg={4} xl={3} ref={setNodeRef} style={style}>
            <Box
                className="group"
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                        const mockEvent = { target: { files: [file] } };
                        handleUpload(doc.id)(mockEvent);
                    }
                }}
                sx={{
                    position: 'relative',
                    bgcolor: 'white',
                    borderRadius: '16px',
                    border: '2px dashed',
                    borderColor: isCompleted
                        ? 'transparent'
                        : (isDragOver ? '#002395' : (isMissing ? '#fecaca' : (isRequired ? '#fdba74' : '#e2e8f0'))),
                    bgcolor: isCompleted ? 'white' : (isMissing ? '#fef2f2' : (isRequired ? '#fff7ed' : '#f8fafc')),
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    boxShadow: isCompleted ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    '&:hover': {
                        borderColor: isCompleted ? 'transparent' : '#002395',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-4px)'
                    },
                    ...(isCompleted && { border: '1px solid #e2e8f0' })
                }}
            >
                {/* Header/Image Area */}
                <Box
                    onClick={() => !fileData && !isMapGenerating && fileInputRefs.current[doc.id]?.click()}
                    sx={{
                        position: 'relative',
                        flex: 1,
                        width: '100%',
                        bgcolor: '#f1f5f9',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isMapGenerating ? (
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
                                    opacity: 0.8,
                                    transition: 'opacity 0.3s',
                                    '.group:hover &': { opacity: 1 }
                                }}
                            />
                            {/* Hover Actions */}
                            <Box sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.4)',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                gap: 1.5,
                                '.group:hover &': { opacity: 1 }
                            }}>
                                <IconButton
                                    onClick={(e) => { e.stopPropagation(); setPreview({ open: true, url: fileData, title: doc.label }); }}
                                    sx={{ bgcolor: 'white', color: '#1e293b', '&:hover': { bgcolor: '#002395', color: 'white' } }}
                                >
                                    <Eye size={18} />
                                </IconButton>
                                <IconButton
                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                    sx={{ bgcolor: 'white', color: '#1e293b', '&:hover': { bgcolor: '#ef4444', color: 'white' } }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Box sx={{
                                size: 56,
                                mx: 'auto',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'full',
                                bgcolor: isMissing ? '#fee2e2' : (isRequired ? '#ffedd5' : '#f1f5f9'),
                                color: isMissing ? '#ef4444' : (isRequired ? '#f97316' : '#64748b'),
                                p: 2
                            }}>
                                {isMissing ? <AlertCircle size={32} /> : (isRequired ? <PlusCircle size={32} /> : <UploadCloud size={32} />)}
                            </Box>
                        </Box>
                    )}

                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                        {isCompleted ? (
                            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                Complété
                            </span>
                        ) : isMissing ? (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                Manquant
                            </span>
                        ) : isRequired ? (
                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                Obligatoire
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                                Optionnel
                            </span>
                        )}
                    </Box>

                    {/* AI Button */}
                    {!fileData && !isMapGenerating && doc.canAutoGenerate && (
                        <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 20 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                disabled={isGeneratingThis}
                                onClick={(e) => { e.stopPropagation(); handleAutoGenerate(doc.id); }}
                                startIcon={isGeneratingThis ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: '#002395',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    fontSize: '11px',
                                    py: 1,
                                    boxShadow: '0 8px 16px rgba(0,35,149,0.2)'
                                }}
                            >
                                Générer par IA
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Info Area */}
                <Box sx={{ p: 4, bgcolor: fileData ? 'white' : 'transparent' }}>
                    <h3 className="text-slate-900 font-bold text-[14px] truncate leading-tight">
                        {doc.id} - {doc.label}
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-1 font-medium truncate">
                        {doc.description}
                    </p>
                </Box>

                <input
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    ref={el => fileInputRefs.current[doc.id] = el}
                    onChange={handleUpload(doc.id)}
                />
            </Box>
        </Grid>
    );
};

function Step8PiecesJointes() {
    const { data, setField, projectConfig, generateTechnicalDocument, isGeneratingDP1 } = useForm();
    const [generating, setGenerating] = useState({});
    const [preview, setPreview] = useState({ open: false, url: '', title: '' });
    const [documentsOrder, setDocumentsOrder] = useState([]);
    const [activeTab, setActiveTab] = useState('required'); // 'required' | 'optional'
    const fileInputRefs = useRef({});

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const isObligatoire = (docId) => projectConfig.requiredDocuments.includes(docId);

    useEffect(() => {
        const allDocIds = Object.keys(DOCUMENTS_INFO);
        const docs = allDocIds.map(docId => ({
            id: docId,
            label: DOCUMENTS_INFO[docId].label,
            description: DOCUMENTS_INFO[docId].description,
            obligatoire: isObligatoire(docId),
            canAutoGenerate: ['dp2', 'dp3', 'dp4'].includes(docId)
        }));
        setDocumentsOrder(docs);
    }, [projectConfig]);

    const requiredDocs = documentsOrder.filter(d => d.obligatoire);
    const optionalDocs = documentsOrder.filter(d => !d.obligatoire);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDocumentsOrder((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

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

    const currentDocs = activeTab === 'required' ? requiredDocs : optionalDocs;

    return (
        <Box sx={{ bgcolor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            {/* Header Mini */}
            <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                <div className="p-2 bg-[#002395]/10 rounded-lg text-[#002395]">
                    <Layout size={20} />
                </div>
                <div>
                    <Typography variant="subtitle1" fontWeight={800} color="#1e293b" sx={{ lineHeight: 1.2 }}>Pièces à joindre</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Gérez les documents requis pour votre dossier</Typography>
                </div>
            </Box>

            {/* Tabs */}
            <Box sx={{ px: 4, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc/50' }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                    <button
                        onClick={() => setActiveTab('required')}
                        className={`flex items-center py-4 border-b-2 font-black text-[12px] uppercase tracking-widest transition-all ${activeTab === 'required'
                            ? 'border-[#002395] text-[#002395]'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Documents requis
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'required' ? 'bg-[#002395]/10 text-[#002395]' : 'bg-slate-100 text-slate-400'}`}>
                            {requiredDocs.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('optional')}
                        className={`flex items-center py-4 border-b-2 font-black text-[12px] uppercase tracking-widest transition-all ${activeTab === 'optional'
                            ? 'border-[#002395] text-[#002395]'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Documents optionnels
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'optional' ? 'bg-[#002395]/10 text-[#002395]' : 'bg-slate-100 text-slate-400'}`}>
                            {optionalDocs.length}
                        </span>
                    </button>
                </Box>
            </Box>

            {/* Content Area */}
            <Box sx={{ p: 4, bgcolor: '#ffffff', minHeight: '600px' }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <Grid container spacing={3}>
                        <SortableContext items={currentDocs.map(d => d.id)} strategy={rectSortingStrategy}>
                            {currentDocs.map((doc) => (
                                <SortableDocumentCard
                                    key={doc.id}
                                    doc={doc}
                                    fileData={getDocumentFile(doc.id)}
                                    isRequired={doc.obligatoire}
                                    isGeneratingThis={generating[doc.id]}
                                    isMapGenerating={(doc.id === 'dp1' || doc.id === 'dp2') && isGeneratingDP1}
                                    handleDelete={handleDelete}
                                    handleUpload={handleUpload}
                                    handleAutoGenerate={handleAutoGenerate}
                                    setPreview={setPreview}
                                    fileInputRefs={fileInputRefs}
                                />
                            ))}
                        </SortableContext>
                    </Grid>
                </DndContext>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 4, py: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Info size={16} className="text-[#002395]" />
                <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>
                    Assurez-vous que tous les documents obligatoires sont joints pour valider votre dossier.
                </Typography>
            </Box>

            {/* Modal de Preview */}
            <Dialog
                open={preview.open}
                onClose={() => setPreview({ ...preview, open: false })}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Zoom}
                PaperProps={{ sx: { borderRadius: '32px', overflow: 'hidden' } }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" fontWeight={800} color="#1e293b">{preview.title}</Typography>
                    <IconButton onClick={() => setPreview({ ...preview, open: false })} sx={{ bgcolor: '#f1f5f9' }}><X size={20} /></IconButton>
                </Box>
                <DialogContent sx={{ p: 0, bgcolor: '#0f172a' }}>
                    <Box component="img" src={preview.url} sx={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'contain' }} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
export default Step8PiecesJointes;
