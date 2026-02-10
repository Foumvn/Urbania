import React from 'react';
import { FormControl, Select, MenuItem, InputLabel, Box, Typography, FormHelperText, Fade } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ErrorIcon from '@mui/icons-material/Error';
import Tooltip from '@mui/material/Tooltip';

function FormSelect({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    helperText,
    helpTooltip,
    required = false,
    disabled = false,
    fullWidth = true,
    ...props
}) {
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
                    <Tooltip title={helpTooltip} placement="top" arrow>
                        <HelpOutlineIcon
                            fontSize="small"
                            sx={{
                                ml: 1,
                                color: 'text.disabled',
                                cursor: 'help',
                                fontSize: '1rem',
                                transition: 'color 0.2s',
                                '&:hover': { color: 'primary.main' },
                            }}
                        />
                    </Tooltip>
                )}
            </Box>

            <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled}>
                <Select
                    id={name}
                    value={value || ''}
                    onChange={(e) => onChange(name, e.target.value)}
                    sx={{
                        borderRadius: '12px',
                        bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: error ? 'error.main' : 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: error ? 'error.main' : 'primary.main',
                        },
                    }}
                    {...props}
                >
                    {options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </Select>
                {error ? (
                    <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 0 }}>
                        <ErrorIcon sx={{ fontSize: 14 }} />
                        {error}
                    </FormHelperText>
                ) : (
                    helperText && <FormHelperText sx={{ mx: 0 }}>{helperText}</FormHelperText>
                )}
            </FormControl>
        </Box>
    );
}

export default FormSelect;
