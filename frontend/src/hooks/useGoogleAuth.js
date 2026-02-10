import { useState } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { loginSuccess } = useAuth();

    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    const signInWithGoogle = async (mode = 'login', preferPopup = true) => {
        setLoading(true);
        setError(null);

        try {
            let result;

            if (preferPopup) {
                // Méthode popup (recommandée pour desktop)
                result = await signInWithPopup(auth, googleProvider);
            } else {
                // Méthode redirect (recommandée pour mobile)
                await signInWithRedirect(auth, googleProvider);
                return; // La suite se fait dans getRedirectResult
            }

            // Récupérer les informations de l'utilisateur Google
            const user = result.user;
            const idToken = await user.getIdToken();

            // Envoyer le token à votre backend pour validation et création/connexion de l'utilisateur
            const response = await fetch(`${API_BASE}/auth/google/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_token: idToken,
                    mode: mode,
                    email: user.email,
                    display_name: user.displayName,
                    photo_url: user.photoURL,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la connexion avec Google');
            }

            const data = await response.json();

            // Mettre à jour le contexte d'authentification
            loginSuccess(data.user, {
                access: data.access,
                refresh: data.refresh
            });

            setLoading(false);
            return { success: true, user: data.user };

        } catch (err) {
            console.error('Google Auth Error:', err);
            setError(err.message || 'Erreur lors de la connexion avec Google');
            setLoading(false);
            return { success: false, error: err.message };
        }
    };

    const checkRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                const user = result.user;
                const idToken = await user.getIdToken();

                const response = await fetch(`${API_BASE}/auth/google/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_token: idToken,
                        email: user.email,
                        display_name: user.displayName,
                        photo_url: user.photoURL,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la connexion avec Google');
                }

                const data = await response.json();

                // Mettre à jour le contexte d'authentification
                loginSuccess(data.user, {
                    access: data.access,
                    refresh: data.refresh
                });

                return { success: true, user: data.user };
            }
        } catch (err) {
            console.error('Redirect Result Error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        signInWithGoogle,
        checkRedirectResult,
        loading,
        error,
    };
};
