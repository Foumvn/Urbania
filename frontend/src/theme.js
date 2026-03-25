import { alpha } from '@mui/material/styles';

// Bleu Urbania officiel
const BLUE_PRIMARY = '#002395';
const BLUE_DARK = '#001a70';
const BLUE_LIGHT = '#3b5fc4';

const extendShadows = (values) => {
  const extended = [...values];
  const fallback = values[values.length - 1];
  while (extended.length < 25) {
    extended.push(fallback);
  }
  return extended;
};

const baseShadowsLight = extendShadows([
  'none',
  '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
]);

const baseShadowsDark = extendShadows([
  'none',
  '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
  '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
]);

const getTheme = (mode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: BLUE_PRIMARY,
      dark: BLUE_DARK,
      light: BLUE_LIGHT,
      contrastText: '#ffffff',
    },
    secondary: {
      main: BLUE_LIGHT,
      light: '#6b8be8',
      dark: BLUE_PRIMARY,
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#fafbfc' : '#0a0f1c',
      paper: mode === 'light' ? '#ffffff' : '#1a1f2e',
      alt: mode === 'light' ? '#f8fafc' : '#111827',
    },
    surface: {
      main: mode === 'light' ? '#ffffff' : '#1a1f2e',
      variant: mode === 'light' ? '#f8fafc' : '#111827',
      hover: mode === 'light' ? '#f1f5f9' : '#1e2536',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#475569' : '#94a3b8',
      tertiary: '#64748b',
      disabled: mode === 'light' ? '#94a3b8' : '#475569',
    },
    border: {
      light: mode === 'light' ? '#e2e8f0' : '#334155',
      main: mode === 'light' ? '#cbd5e1' : '#475569',
      dark: mode === 'light' ? '#94a3b8' : '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
    action: {
      hover: alpha(BLUE_PRIMARY, mode === 'light' ? 0.06 : 0.1),
      selected: alpha(BLUE_PRIMARY, mode === 'light' ? 0.08 : 0.12),
      disabled: mode === 'light' ? '#f1f5f9' : '#1a1f2e',
      disabledBackground: mode === 'light' ? '#e2e8f0' : '#334155',
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
  shadows: mode === 'light' ? baseShadowsLight : baseShadowsDark,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          height: '100%',
        },
        body: {
          backgroundColor: mode === 'light' ? '#fafbfc' : '#0a0f1c',
          color: mode === 'light' ? '#0f172a' : '#f8fafc',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.5,
          margin: 0,
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: mode === 'light' ? '#f1f5f9' : '#1a1f2e',
        },
        '::-webkit-scrollbar-thumb': {
          background: mode === 'light' ? '#cbd5e1' : '#475569',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'light' ? '#94a3b8' : '#64748b',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.025em',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            transition: 'width 0.3s, height 0.3s',
            transform: 'translate(-50%, -50%)',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light'
              ? '0 8px 25px -5px rgba(0, 35, 149, 0.25), 0 4px 10px -2px rgba(0, 35, 149, 0.1)'
              : '0 8px 25px -5px rgba(0, 35, 149, 0.4), 0 4px 10px -2px rgba(0, 35, 149, 0.2)',
            '&:before': {
              width: '300px',
              height: '300px',
            },
          },
          '&:active': {
            transform: 'translateY(0)',
            transition: 'all 0.1s',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BLUE_PRIMARY} 0%, ${BLUE_DARK} 100%)`,
          color: '#ffffff',
          boxShadow: '0 4px 14px 0 rgba(0, 35, 149, 0.3)',
          '&:hover': {
            background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE_PRIMARY} 100%)`,
            boxShadow: '0 8px 25px -5px rgba(0, 35, 149, 0.4), 0 4px 10px -2px rgba(0, 35, 149, 0.2)',
          },
          '&:active': {
            boxShadow: '0 2px 8px 0 rgba(0, 35, 149, 0.4)',
          },
        },
        outlinedPrimary: {
          borderColor: BLUE_PRIMARY,
          borderWidth: 1.5,
          color: BLUE_PRIMARY,
          backgroundColor: 'transparent',
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: alpha(BLUE_PRIMARY, mode === 'light' ? 0.08 : 0.12),
            boxShadow: '0 4px 12px rgba(0, 35, 149, 0.15)',
          },
        },
        textPrimary: {
          color: BLUE_PRIMARY,
          '&:hover': {
            backgroundColor: alpha(BLUE_PRIMARY, mode === 'light' ? 0.08 : 0.12),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: mode === 'light' ? '#e2e8f0' : '#334155',
              borderWidth: 1.5,
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: BLUE_PRIMARY,
              borderWidth: 1.5,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
              borderColor: BLUE_PRIMARY,
              boxShadow: `0 0 0 4px rgba(0, 35, 149, ${mode === 'light' ? 0.1 : 0.2})`,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px rgba(0, 35, 149, ${mode === 'light' ? 0.1 : 0.2})`,
            },
            '& .MuiOutlinedInput-input': {
              padding: '16px 14px',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&::placeholder': {
                color: mode === 'light' ? '#94a3b8' : '#64748b',
                opacity: 0.8,
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 12,
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 600,
            color: mode === 'light' ? '#475569' : '#94a3b8',
            '&.Mui-focused': {
              color: BLUE_PRIMARY,
              fontWeight: 700,
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            fontWeight: 500,
            marginTop: 4,
            marginLeft: 0,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
          border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light'
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.1)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 10px -2px rgba(0, 0, 0, 0.3)',
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${BLUE_PRIMARY}, ${BLUE_LIGHT})`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover:before': {
            opacity: 1,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
          transition: 'background-color 0.3s ease',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        },
        elevation3: {
          boxShadow: mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
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
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '6px 12px',
          padding: '12px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&.Mui-selected': {
            backgroundColor: `rgba(0, 35, 149, ${mode === 'light' ? 0.12 : 0.2})`,
            color: BLUE_PRIMARY,
            fontWeight: 600,
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0, 35, 149, 0.15)'
              : '0 2px 8px rgba(0, 35, 149, 0.3)',
            '&:hover': {
              backgroundColor: `rgba(0, 35, 149, ${mode === 'light' ? 0.16 : 0.25})`,
            },
            '& .MuiListItemIcon-root': {
              color: BLUE_PRIMARY,
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f1f5f9' : '#1e2536',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
          backgroundImage: 'none',
          transition: 'background-color 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
          borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
          color: mode === 'light' ? '#0f172a' : '#f8fafc',
        },
      },
    },
  },
});

export default getTheme;
