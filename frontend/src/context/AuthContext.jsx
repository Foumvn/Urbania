import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("urbania_user");

        if (token) {
            setIsAuthenticated(true);
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error("Failed to parse saved user", e);
                }
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post("/auth/login/", credentials);
            const { access, refresh, user: userData } = response.data;

            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("urbania_user", JSON.stringify(userData));

            setIsAuthenticated(true);
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.response?.data?.detail || "Identifiants invalides"
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post("/auth/register/", userData);
            const { access, refresh, user: registeredUser } = response.data;

            if (access) {
                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);
                localStorage.setItem("urbania_user", JSON.stringify(registeredUser));
                setIsAuthenticated(true);
                setUser(registeredUser);
            }

            return { success: true, user: registeredUser };
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("urbania_user");
        setIsAuthenticated(false);
        setUser(null);
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('urbania_user', JSON.stringify(updatedUser));
    };

    // Keep addDossier for backward compatibility if needed
    const addDossier = (dossier) => {
        const newDossier = {
            id: `dossier_${Date.now()}`,
            ...dossier,
            createdAt: new Date().toISOString(),
            status: 'completed',
        };

        const updatedDossiers = [...(user?.dossiers || []), newDossier];
        updateUser({ dossiers: updatedDossiers });

        return newDossier;
    };

    const value = {
        isAuthenticated,
        loading,
        user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        addDossier
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
