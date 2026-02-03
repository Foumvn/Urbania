import { Box, Typography, Paper, RadioGroup, FormControlLabel, Radio, Divider, Stack } from '@mui/material';
import { useI18n } from '../../context/I18nContext';
import { useAppTheme } from '../../context/ThemeContext';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function Settings() {
    const { lang, setLang, t } = useI18n();
    const { mode, toggleTheme } = useAppTheme();

    const handleLanguageChange = (event) => {
        setLang(event.target.value);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                {t('settings.title')}
            </Typography>

            <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 600, mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <LanguageIcon color="primary" />
                    <Typography variant="h6">
                        {t('settings.language')}
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <RadioGroup
                    aria-label="language"
                    name="language-selection"
                    value={lang}
                    onChange={handleLanguageChange}
                >
                    <FormControlLabel
                        value="fr"
                        control={<Radio />}
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <span style={{ fontSize: '1.5rem' }}>🇫🇷</span>
                                <Typography>Français</Typography>
                            </Stack>
                        }
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        value="en"
                        control={<Radio />}
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <span style={{ fontSize: '1.5rem' }}>🇬🇧</span>
                                <Typography>English</Typography>
                            </Stack>
                        }
                    />
                </RadioGroup>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 4, maxWidth: 600 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <DarkModeIcon color="primary" />
                    <Typography variant="h6">
                        Apparence
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <RadioGroup
                    aria-label="theme"
                    name="theme-selection"
                    value={mode}
                    onChange={(e) => mode !== e.target.value && toggleTheme()}
                >
                    <FormControlLabel
                        value="light"
                        control={<Radio />}
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LightModeIcon sx={{ fontSize: '1.2rem', color: 'warning.main' }} />
                                <Typography>Mode Clair</Typography>
                            </Stack>
                        }
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        value="dark"
                        control={<Radio />}
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <DarkModeIcon sx={{ fontSize: '1.2rem', color: 'primary.light' }} />
                                <Typography>Mode Sombre</Typography>
                            </Stack>
                        }
                    />
                </RadioGroup>

                <Box sx={{ mt: 5, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TranslateIcon sx={{ fontSize: '1rem', mr: 1 }} />
                        {lang === 'fr'
                            ? 'L\'interface sera automatiquement mise à jour.'
                            : 'The interface will be updated automatically.'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default Settings;
