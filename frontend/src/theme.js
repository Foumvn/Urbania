import { alpha } from '@mui/material/styles';

const getTheme = (mode) => ({
    palette: {
        mode,
        primary: {
            main: '#583da1', // Modern Purple from maquette
            dark: '#432d80',
            light: '#7c62c1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#7c62c1', // Lighter Violet
            light: '#a996db',
            dark: '#583da1',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'light' ? '#f3f4f6' : '#111827',
            paper: mode === 'light' ? '#ffffff' : '#1f2937',
        },
        text: {
            primary: mode === 'light' ? '#1e293b' : '#f8fafc',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
        divider: mode === 'light' ? '#e2e8f0' : '#374151',
        action: {
            hover: alpha('#583da1', 0.04),
            selected: alpha('#583da1', 0.08),
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        h2: {
            fontSize: '1.875rem',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.025em',
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.3,
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: mode === 'light' ? '#1e293b' : '#ffffff',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            color: mode === 'light' ? '#475569' : '#94a3b8',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: mode === 'light' ? '#475569' : '#94a3b8',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: mode === 'light' ? '#64748b' : '#64748b',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: mode === 'light' ? [
        'none',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        ...Array(20).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)'),
    ] : [
        'none',
        '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
        ...Array(20).fill('0 25px 50px -12px rgba(0, 0, 0, 0.7)'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: mode === 'light' ? '#f3f4f6' : '#111827',
                    transition: 'all 0.3s ease',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#583da1',
                    boxShadow: '0 4px 6px -1px rgba(88, 61, 161, 0.2)',
                    '&:hover': {
                        backgroundColor: '#432d80',
                        boxShadow: '0 10px 15px -3px rgba(88, 61, 161, 0.3)',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#583da1',
                    color: '#583da1',
                    borderWidth: 1.5,
                    '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: alpha('#583da1', 0.05),
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1f2937',
                        '& fieldset': {
                            borderColor: mode === 'light' ? '#e2e8f0' : '#374151',
                            borderWidth: 1,
                        },
                        '&:hover fieldset': {
                            borderColor: '#583da1',
                        },
                        '&.Mui-focused fieldset': {
                            borderWidth: 2,
                            borderColor: '#583da1',
                        },
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #374151',
                    backgroundColor: mode === 'light' ? '#ffffff' : '#1f2937',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: mode === 'light' ? '#ffffff' : '#1f2937',
                },
                rounded: {
                    borderRadius: 16,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid',
                    borderColor: mode === 'light' ? '#e2e8f0' : '#374151',
                    backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#583da1', 0.1),
                        color: '#583da1',
                        '&:hover': {
                            backgroundColor: alpha('#583da1', 0.15),
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#583da1',
                        },
                    },
                },
            },
        },
    },
});

export default getTheme;
