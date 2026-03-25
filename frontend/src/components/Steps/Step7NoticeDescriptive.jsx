import React, { useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Sparkles,
    Info,
    FileText,
    Check,
    RotateCcw,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step7NoticeDescriptive() {
    const {
        data,
        setField,
        errors,
        generateNoticeDescriptiveWithAI,
    } = useForm();

    const [isGenerating, setIsGenerating] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const textareaRef = useRef(null);

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleChange = (name, value) => {
        setSaveStatus('saving');
        setField(name, value);
        // Simulate auto-save delay
        setTimeout(() => setSaveStatus('saved'), 1000);
    };

    const formatSelection = (formatter) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart = 0, selectionEnd = 0, value = '' } = textarea;
        const selected = value.slice(selectionStart, selectionEnd) || '';

        let wrappedText = selected;
        let cursorOffsetStart = 0;
        let cursorOffsetEnd = 0;

        switch (formatter) {
            case 'bold':
                wrappedText = `**${selected || 'Texte en gras'}**`;
                cursorOffsetStart = 2;
                cursorOffsetEnd = wrappedText.length - 2;
                break;
            case 'italic':
                wrappedText = `_${selected || 'Texte en italique'}_`;
                cursorOffsetStart = 1;
                cursorOffsetEnd = wrappedText.length - 1;
                break;
            case 'underline':
                wrappedText = `<u>${selected || 'Texte souligné'}</u>`;
                cursorOffsetStart = 3;
                cursorOffsetEnd = wrappedText.length - 4;
                break;
            case 'bullet':
                wrappedText = selected ? selected.split('\n').map(line => (line.startsWith('- ') ? line : `- ${line || 'Élément'}`)).join('\n') : '- Élément';
                cursorOffsetStart = wrappedText.length;
                cursorOffsetEnd = wrappedText.length;
                break;
            case 'numbered':
                wrappedText = selected ? selected.split('\n').map((line, index) => `${index + 1}. ${line || 'Élément'}`).join('\n') : '1. Élément';
                cursorOffsetStart = wrappedText.length;
                cursorOffsetEnd = wrappedText.length;
                break;
            case 'quote':
                wrappedText = selected ? selected.split('\n').map(line => `> ${line || 'Citation'}`).join('\n') : '> Citation';
                cursorOffsetStart = wrappedText.length;
                cursorOffsetEnd = wrappedText.length;
                break;
            default:
                break;
        }

        const newValue = `${value.slice(0, selectionStart)}${wrappedText}${value.slice(selectionEnd)}`;
        handleChange('noticeDescriptive', newValue);

        const newStart = selectionStart + cursorOffsetStart;
        const newEnd = selectionStart + cursorOffsetEnd;

        requestAnimationFrame(() => {
            textarea.focus();
            const startPos = cursorOffsetEnd ? newEnd : newValue.length;
            const endPos = cursorOffsetEnd ? newEnd : newValue.length;
            textarea.setSelectionRange(newStart || startPos, endPos);
        });
    };

    const formattingButtons = [
        { id: 'bold', icon: <Bold size={14} />, label: 'Gras' },
        { id: 'italic', icon: <Italic size={14} />, label: 'Italique' },
        { id: 'underline', icon: <Underline size={14} />, label: 'Souligné' },
        { id: 'bullet', icon: <List size={14} />, label: 'Liste à puces' },
        { id: 'numbered', icon: <ListOrdered size={14} />, label: 'Liste numérotée' },
        { id: 'quote', icon: <Quote size={14} />, label: 'Citation' },
    ];

    const handleGenerateNotice = async () => {
        if (!data.descriptionProjet) {
            setSnackbar({
                open: true,
                message: 'Veuillez d\'abord remplir la description à l\'étape précédente.',
                severity: 'warning'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const notice = await generateNoticeDescriptiveWithAI(data);
            if (notice) {
                setField('noticeDescriptive', notice);
                setSaveStatus('saved');
                setSnackbar({ open: true, message: 'Notice descriptive générée avec succès !', severity: 'success' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur lors de la génération.', severity: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
                    Notice Descriptive <span style={{ color: '#002395' }}>(DP11)</span>
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
                    Détaillez l'état du terrain et l'insertion de votre projet dans son environnement.
                </Typography>
            </Box>

            <Box sx={{
                mb: 4,
                p: 2,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #002395 0%, #001a6e 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0,35,149,0.1)'
            }}>
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Info size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0, lineHeight: 1.2 }}>Conseil d'expert</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1.4, fontWeight: 500 }}>
                            Insistez sur les matériaux utilisés et leur harmonie avec le voisinage.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                position: 'relative',
                bgcolor: 'white',
                borderRadius: '32px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:focus-within': {
                    borderColor: '#002395',
                    boxShadow: '0 0 0 4px rgba(0,35,149,0.05)'
                }
            }}>
                {/* Editor Header */}
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#f8fafc',
                    borderRadius: '32px 32px 0 0',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-[#002395]" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Document DP11</span>
                        </div>
                        <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {saveStatus === 'saving' ? (
                                <>
                                    <CircularProgress size={12} thickness={6} sx={{ color: '#002395' }} />
                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Synchronisation...</Typography>
                                </>
                            ) : (
                                <>
                                    <Check size={14} className="text-emerald-500" />
                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Enregistré</Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {saveStatus === 'saving' ? (
                            <>
                                <CircularProgress size={12} thickness={6} sx={{ color: '#002395' }} />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Synchronisation...</Typography>
                            </>
                        ) : (
                            <>
                                <Check size={14} className="text-emerald-500" />
                                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Enregistré</Typography>
                            </>
                        )}
                    </Box>
                </Box>

                {/* Formatting toolbar + actions */}
                <Box sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    bgcolor: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f8fafc', borderRadius: '999px', px: 1, py: 0.5, border: '1px solid #e2e8f0' }}>
                        {formattingButtons.map((btn) => (
                            <Tooltip key={btn.id} title={btn.label} arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => formatSelection(btn.id)}
                                    sx={{ color: '#0f172a' }}
                                >
                                    {btn.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            onClick={handleGenerateNotice}
                            disabled={isGenerating}
                            sx={{
                                bgcolor: '#002395',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 800,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                display: 'flex',
                                gap: 1,
                                boxShadow: '0 4px 12px rgba(0,35,149,0.15)',
                                '&:hover': {
                                    bgcolor: '#001a6e',
                                    transform: 'translateY(-1px)',
                                },
                                '&:disabled': {
                                    bgcolor: '#e2e8f0',
                                    color: '#94a3b8'
                                }
                            }}
                        >
                            {isGenerating ? (
                                <CircularProgress size={14} thickness={6} sx={{ color: 'white' }} />
                            ) : (
                                <Sparkles size={14} />
                            )}
                            <span>{data.noticeDescriptive ? 'Améliorer avec l\'IA' : 'Rédiger avec l\'IA'}</span>
                        </Button>

                        <Button
                            variant="text"
                            size="small"
                            startIcon={<RotateCcw size={14} />}
                            onClick={() => handleChange('noticeDescriptive', '')}
                            sx={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'none' }}
                        >
                            Réinitialiser
                        </Button>
                    </Box>
                </Box>

                {/* Textarea */}
                <textarea
                    value={data.noticeDescriptive || ''}
                    ref={textareaRef}
                    onChange={(e) => handleChange('noticeDescriptive', e.target.value)}
                    placeholder="Commencez à rédiger ou utilisez l'IA..."
                    className="w-full min-h-[500px] p-8 text-lg text-slate-700 placeholder:text-slate-300 border-none outline-none resize-none leading-relaxed font-medium bg-transparent"
                />
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '16px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// Helper Grid mock if not imported (MUI)
const Grid = ({ children, container, item, xs, sm, spacing }) => (
    <Box
        sx={{
            display: container ? 'flex' : 'block',
            flexWrap: container ? 'wrap' : 'nowrap',
            m: container ? -(spacing || 0) / 2 : 0,
            '& > div': item ? { p: (spacing || 0) / 2 } : {}
        }}
    >
        {children}
    </Box>
);

export default Step7NoticeDescriptive;
