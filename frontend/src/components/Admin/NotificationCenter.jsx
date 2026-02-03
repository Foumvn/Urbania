import { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';

function NotificationCenter({ notifications, onMarkAllRead, onRefresh }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        onRefresh();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAllRead = () => {
        onMarkAllRead();
        handleClose();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_user': return <PersonAddIcon />;
            case 'new_admin': return <SecurityIcon />;
            case 'new_session': return <DescriptionIcon />;
            default: return <InfoIcon />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'new_user': return 'primary.main';
            case 'new_admin': return 'error.main';
            case 'new_session': return 'secondary.main';
            default: return 'info.main';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <Box>
            <IconButton sx={{ color: 'white' }} onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 500,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        mt: 1.5,
                        overflow: 'hidden'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Tout marquer lu
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Aucune notification
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notif) => (
                            <ListItem
                                key={notif.id}
                                sx={{
                                    bgcolor: notif.is_read ? 'transparent' : 'action.selected',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: getColor(notif.notification_type), color: 'white' }}>
                                        {getIcon(notif.notification_type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={notif.title}
                                    secondary={
                                        <>
                                            <Typography variant="caption" display="block" color="text.primary" sx={{ my: 0.5 }}>
                                                {notif.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTime(notif.created_at)}
                                            </Typography>
                                        </>
                                    }
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: notif.is_read ? 500 : 700 }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>

                <Divider />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Button fullWidth onClick={handleClose}>Fermer</Button>
                </Box>
            </Menu>
        </Box>
    );
}

export default NotificationCenter;
