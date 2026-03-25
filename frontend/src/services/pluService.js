import api from './api';

export const analyzePLU = async ({ commune, section = '', parcelle = '', description = '', saveRecord = true }) => {
    const payload = {
        commune,
        section,
        parcelle,
        description,
        save_record: saveRecord,
    };

    const { data } = await api.post('/ai/analyze-plu/', payload);
    if (data?.analysis) {
        return data;
    }
    return { analysis: data, record: null };
};

export const fetchPLUHistory = async () => {
    const { data } = await api.get('/ai/plu-history/');
    return data;
};
