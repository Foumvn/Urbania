import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(localStorage.getItem('urbania_theme') || 'light');

    useEffect(() => {
        localStorage.setItem('urbania_theme', mode);
    }, [mode]);

    const theme = useMemo(() => createTheme(getTheme(mode)), [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export const useAppTheme = () => useContext(ThemeContext);
