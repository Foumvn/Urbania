// Storage utilities for localStorage persistence

export function saveToStorage(key, data) {
    try {
        // Create a lightweight copy to avoid QuotaExceededError
        let cleanData = data;
        if (data && typeof data === 'object') {
            cleanData = { ...data };
            // Remove heavy fields if present at root or inside 'data'
            if (cleanData.data) {
                const innerData = { ...cleanData.data };
                delete innerData.cadastralPlanImage; // Huge base64 image
                delete innerData.piecesJointes;      // Potential file data
                delete innerData.signature;          // Signature image
                cleanData.data = innerData;
            }
        }

        const serialized = JSON.stringify(cleanData);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

export function loadFromStorage(key) {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

export function clearAllStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}
