import { TextField, Box, Typography, InputAdornment, Fade } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Tooltip from '@mui/material/Tooltip';

function FormField({
    label,
    name,
    value,
    onChange,
    error,
    helperText,
    helpTooltip,
    required = false,
    type = 'text',
    multiline = false,
    rows = 1,
    placeholder,
    disabled = false,
    startAdornment,
    endAdornment,
    fullWidth = true,
    showValidIcon = false,
    ...props
}) {
    const hasValue = value && value.toString().trim() !== '';
    const isValid = hasValue && !error;

    return (
        <Box sx={{ mb: 2.5 }} className="field-animate">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                    component="label"
                    htmlFor={name}
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
                >
                    {label}
                    {required && (
                        <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                            *
                        </Typography>
                    )}
                </Typography>
                {helpTooltip && (
                    <Tooltip
                        title={helpTooltip}
                        placement="top"
                        arrow
                    >
                        <HelpOutlineIcon
                            fontSize="small"
                            sx={{
                                ml: 1,
                                color: 'text.disabled',
                                cursor: 'help',
                                fontSize: '1rem',
                                transition: 'color 0.2s',
                                '&:hover': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    </Tooltip>
                )}
            </Box>
            <TextField
                id={name}
                name={name}
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                error={!!error}
                helperText={
                    error ? (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ErrorIcon sx={{ fontSize: 14 }} />
                            {error}
                        </Box>
                    ) : helperText
                }
                type={type}
                multiline={multiline}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                fullWidth={fullWidth}
                size="medium"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                        transition: 'all 0.2s ease',
                        '& fieldset': {
                            borderColor: isValid && showValidIcon ? 'success.main' : undefined,
                            borderWidth: isValid && showValidIcon ? 1.5 : undefined,
                        },
                        '&:hover': {
                            '& fieldset': {
                                borderColor: disabled ? undefined : error ? 'error.main' : isValid ? 'success.main' : 'primary.main',
                            },
                        },
                        '&.Mui-focused': {
                            '& fieldset': {
                                borderColor: error ? 'error.main' : 'primary.main',
                            },
                        },
                    },
                }}
                InputProps={{
                    startAdornment: startAdornment ? (
                        <InputAdornment position="start">{startAdornment}</InputAdornment>
                    ) : null,
                    endAdornment: (
                        <>
                            {endAdornment && (
                                <InputAdornment position="end">
                                    <Typography variant="body2" color="text.secondary">
                                        {endAdornment}
                                    </Typography>
                                </InputAdornment>
                            )}
                            {isValid && showValidIcon && !disabled && (
                                <Fade in>
                                    <InputAdornment position="end">
                                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                    </InputAdornment>
                                </Fade>
                            )}
                            {error && (
                                <Fade in>
                                    <InputAdornment position="end">
                                        <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                    </InputAdornment>
                                </Fade>
                            )}
                        </>
                    ),
                }}
                {...props}
            />
        </Box>
    );
}

export default FormField;
