import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function LoadingScreen({ onFinished }) {
    const words = ['Initialisation', 'Analyse', 'Core', 'Module', 'Système', 'Prêt'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (currentIndex < words.length - 1) {
            const timer = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
            }, 1200);
            return () => clearTimeout(timer);
        } else if (!isAuthorized) {
            const timer = setTimeout(() => {
                setIsAuthorized(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, words.length, isAuthorized]);

    useEffect(() => {
        if (isAuthorized) {
            const timer = setTimeout(() => {
                if (onFinished) onFinished();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuthorized, onFinished]);

    const progress = ((currentIndex + 1) / words.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.05,
                transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
            }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 0.9, 1],
                        x: [0, 30, -20, 0],
                        y: [0, -50, 20, 0],
                        opacity: [0.1, 0.2, 0.1, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#002395]/10 blur-[80px]"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 0.9, 1.1, 1.1],
                        x: [0, -30, 20, 0],
                        y: [0, 50, -20, 0],
                        opacity: [0.15, 0.08, 0.15, 0.15]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute -bottom-[5%] -right-[5%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[80px]"
                />
            </div>

            <div
                className="relative z-10 w-full max-w-lg h-[400px] flex flex-col items-center justify-center overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)'
                }}
            >
                <motion.div
                    ref={containerRef}
                    className="flex flex-col items-center gap-16"
                    animate={{ y: -currentIndex * 96 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                >
                    {words.map((word, idx) => {
                        const distance = Math.abs(idx - currentIndex);
                        const isActive = idx === currentIndex;
                        const isFinal = isAuthorized && isActive;

                        let opacity = 0.15;
                        if (isActive) opacity = 1;
                        else if (distance === 1) opacity = 0.45;
                        else if (distance === 2) opacity = 0.25;

                        const scale = isActive ? 1.05 : 0.95;
                        const blur = isActive ? 0 : distance * 0.6;

                        return (
                            <motion.span
                                key={word}
                                animate={{
                                    opacity: isFinal ? 1 : opacity,
                                    scale: scale,
                                    filter: `blur(${blur}px)`
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="text-5xl md:text-6xl font-medium tracking-tight text-[#002395] whitespace-nowrap"
                                style={{
                                    textShadow: isActive ? '0 0 30px rgba(0, 35, 149, 0.1)' : 'none'
                                }}
                            >
                                {isFinal ? 'Autorisé' : word}
                            </motion.span>
                        );
                    })}
                </motion.div>
            </div>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <div className="w-[280px] h-[2px] bg-[#002395]/5 rounded overflow-hidden relative">
                    <motion.div
                        className="h-full relative"
                        initial={{ width: "0%" }}
                        animate={{ width: isAuthorized ? "100%" : `${progress}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            background: 'linear-gradient(90deg, #002395, #3b82f6, #002395)',
                            boxShadow: '0 0 15px rgba(0, 35, 149, 0.3)'
                        }}
                    >
                        <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                    </motion.div>
                </div>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#002395]/40 font-medium">
                    {isAuthorized ? "Configuration Terminée" : "Initialisation du Core"}
                </span>
            </div>
        </motion.div>
    );
}
