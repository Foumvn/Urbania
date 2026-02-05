"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import LoadingScreen from "@/components/LoadingScreen";

interface AuthLoadingContextType {
    startLoading: (duration?: number) => void;
    isLoading: boolean;
}

const AuthLoadingContext = createContext<AuthLoadingContextType | undefined>(undefined);

export function AuthLoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = useCallback((duration: number = 9000) => {
        setIsLoading(true);
    }, []);

    const handleFinished = useCallback(() => {
        setIsLoading(false);
    }, []);

    return (
        <AuthLoadingContext.Provider value={{ startLoading, isLoading }}>
            {isLoading && <LoadingScreen onFinished={handleFinished} />}
            {children}
        </AuthLoadingContext.Provider>
    );
}

export function useAuthLoading() {
    const context = useContext(AuthLoadingContext);
    if (context === undefined) {
        throw new Error("useAuthLoading must be used within an AuthLoadingProvider");
    }
    return context;
}
