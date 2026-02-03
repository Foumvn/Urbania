import { Box, Typography, Paper, Grid, Avatar, Divider, Chip } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';

function Profile() {
    const { user, isAdmin } = useAuth();
    const { t } = useI18n();

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                {t('profile.title')}
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                margin: '0 auto 24px',
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {user?.first_name} {user?.last_name}
                        </Typography>
                        <Chip
                            icon={<SecurityIcon sx={{ fontSize: '1rem !important' }} />}
                            label={isAdmin ? 'Administrateur' : 'Client'}
                            color={isAdmin ? 'secondary' : 'primary'}
                            sx={{ mt: 2, px: 2 }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <BadgeIcon sx={{ mr: 1 }} /> {t('profile.details')}
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Prénom
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user?.first_name}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Nom
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user?.last_name}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
                                        Email
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user?.email}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Profile;
