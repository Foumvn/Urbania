import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

const AuthLoadingContext = createContext(undefined);

export function AuthLoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState(null);
    const navigate = useNavigate();

    const startLoading = useCallback((path = null) => {
        setRedirectPath(path);
        setIsLoading(true);
    }, []);

    const handleFinished = useCallback(() => {
        setIsLoading(false);
        if (redirectPath) {
            navigate(redirectPath);
            setRedirectPath(null);
        }
    }, [redirectPath, navigate]);

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
