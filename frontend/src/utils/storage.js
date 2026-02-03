// Storage utilities for localStorage persistence

export function saveToStorage(key, data) {
    try {
        const serialized = JSON.stringify(data);
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
