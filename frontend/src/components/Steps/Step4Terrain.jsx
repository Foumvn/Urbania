import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, Checkbox, FormControlLabel, Paper, Fade, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Hash,
    Building2,
    Navigation,
    Search,
    CheckCircle2,
    Info,
    Move,
    LocateFixed,
    Scan,
    Loader2
} from 'lucide-react';
import { useForm } from '../../context/FormContext';
import FormField from '../Common/FormField';

function Step4Terrain() {
    const { data, setField, setMultipleFields, errors, setIsGeneratingDP1, isGeneratingDP1 } = useForm();
    const [sameAddress, setSameAddress] = useState(false);
    const [searchPhase, setSearchPhase] = useState(0); // 0: Init, 1: Commune, 2: Section, 3: Parcelle

    useEffect(() => {
        let interval;
        if (isGeneratingDP1) {
            setSearchPhase(1);
            interval = setInterval(() => {
                setSearchPhase(prev => (prev % 3) + 1);
            }, 1000);
        } else {
            setSearchPhase(0);
        }
        return () => clearInterval(interval);
    }, [isGeneratingDP1]);

    const getSearchText = () => {
        switch (searchPhase) {
            case 1: return "Identification de la commune...";
            case 2: return "Analyse du cadastre...";
            case 3: return "Centrage sur la parcelle...";
            default: return "Localisation en cours...";
        }
    };

    const handleChange = (name, value) => {
        setField(name, value);
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <AnimatePresence>
                {isGeneratingDP1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-[32px] border-2 border-[#002395]/10"
                    >
                        <div className="relative size-48 flex items-center justify-center">
                            {/* Animated Radar Rings */}
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: 1.5,
                                        opacity: [0, 0.4, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="absolute inset-0 border-2 border-[#002395] rounded-full"
                                />
                            ))}

                            {/* Scanning Line */}
                            <motion.div
                                className="absolute inset-0 z-10"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#002395] origin-right absolute left-0 top-1/2" />
                            </motion.div>

                            {/* Core Icon */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="size-20 bg-[#002395] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 relative z-20"
                            >
                                <LocateFixed size={40} />
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-12 text-center"
                        >
                            <h3 className="text-2xl font-black text-[#002395] tracking-tight mb-2 uppercase italic">
                                Scan Cadastral
                            </h3>
                            <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
                                <Loader2 className="animate-spin size-4" />
                                {getSearchText()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}>
                Localisation et références cadastrales du terrain où seront réalisés les travaux.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '24px',
                            border: '1px solid rgba(0, 35, 149, 0.1)',
                            bgcolor: 'white',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 10px 25px -5px rgba(0,35,149,0.05)',
                                borderColor: 'rgba(0,35,149,0.2)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002395]">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <Typography variant="h6" fontWeight={900} color="#1e293b" sx={{ lineHeight: 1.1 }}>
                                    Localisation du projet
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', tracking: '0.1em' }}>
                                    Référencement IGN / Cadastre
                                </Typography>
                            </div>
                        </Box>

                        <Grid container spacing={3} alignItems="flex-end">
                            <Grid item xs={12} sm={4}>
                                <FormField
                                    label="Commune"
                                    name="terrainVille"
                                    value={data.terrainVille}
                                    onChange={handleChange}
                                    error={errors.terrainVille}
                                    required
                                    placeholder="Ex: Toulouse"
                                    endAdornment={data.piecesJointes?.dp1 ? <CheckCircle2 size={18} className="text-emerald-500" /> : null}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <FormField
                                    label="Section"
                                    name="section"
                                    value={data.section}
                                    onChange={handleChange}
                                    error={errors.section}
                                    required
                                    placeholder="Ex: AB"
                                    endAdornment={data.piecesJointes?.dp1 ? <CheckCircle2 size={18} className="text-emerald-500" /> : null}
                                />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <FormField
                                    label="N° Parcelle"
                                    name="numeroParcelle"
                                    value={data.numeroParcelle}
                                    onChange={handleChange}
                                    error={errors.numeroParcelle}
                                    required
                                    placeholder="Ex: 45"
                                    endAdornment={data.piecesJointes?.dp1 ? <CheckCircle2 size={18} className="text-emerald-500" /> : null}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormField
                                    label="Surface du terrain (m²)"
                                    name="surfaceTerrain"
                                    value={data.surfaceTerrain}
                                    onChange={handleChange}
                                    error={errors.surfaceTerrain}
                                    type="number"
                                    placeholder="Ex: 500"
                                    endAdornment={data.piecesJointes?.dp1 ? <CheckCircle2 size={18} className="text-emerald-500" /> : null}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <button
                                    onClick={() => {
                                        setIsGeneratingDP1(true);
                                        setField('mapTriggerCount', (data.mapTriggerCount || 0) + 1);
                                    }}
                                    disabled={isGeneratingDP1}
                                    className={`
                                        w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px]
                                        flex items-center justify-center gap-3 transition-all
                                        ${isGeneratingDP1 ? 'bg-slate-100 text-slate-400' : 'bg-[#002395] text-white hover:bg-[#001a6e] shadow-lg shadow-blue-900/20 active:scale-95'}
                                    `}
                                >
                                    {isGeneratingDP1 ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Analyse en cours
                                        </>
                                    ) : (
                                        <>
                                            <Search size={18} />
                                            Rechercher ma parcelle
                                        </>
                                    )}
                                </button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}


export default Step4Terrain;
