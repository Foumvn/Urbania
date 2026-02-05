"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                // Verify token or fetch user profile
                setIsAuthenticated(true);
                // In a real app: await fetchUserProfile(); 
            } catch (error) {
                logout();
            }
        }
        setIsLoading(false);
    };

    const login = async (credentials: any) => {
        try {
            const response = await api.post("/auth/login/", credentials);
            const { access, refresh, user } = response.data;

            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            setIsAuthenticated(true);
            if (user) setUser(user);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            await api.post("/auth/register/", userData);
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
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
