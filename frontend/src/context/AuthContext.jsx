import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        try {
            const savedToken = localStorage.getItem('urbania_token');
            const savedUser = localStorage.getItem('urbania_user');
            if (savedToken && savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Failed to parse saved user:', error);
            localStorage.removeItem('urbania_token');
            localStorage.removeItem('urbania_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                localStorage.setItem('urbania_token', data.access);
                localStorage.setItem('urbania_user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Identifiants invalides');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (formData) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.email,
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    first_name: formData.prenom,
                    last_name: formData.nom,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                localStorage.setItem('urbania_token', data.access);
                localStorage.setItem('urbania_user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                // Handle complex validation errors from Django Rest Framework
                let errorMsg = 'Erreur lors de l\'inscription';
                if (typeof data === 'object') {
                    // Extract all error messages and join them nicely
                    const messages = [];
                    for (const [key, value] of Object.entries(data)) {
                        const fieldName = key === 'non_field_errors' ? '' : `${key} : `;
                        messages.push(Array.isArray(value) ? value[0] : value);
                    }
                    errorMsg = messages.join('\n');
                }
                throw new Error(errorMsg);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('urbania_token');
        localStorage.removeItem('urbania_user');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('urbania_user', JSON.stringify(updatedUser));
    };

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
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        addDossier,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
