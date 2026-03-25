export const stripMarkdown = (text = '') => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\s*\*\s+/g, '- ')
        .replace(/#{1,6}\s*/g, '')
        .replace(/>\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const formatPLUValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return stripMarkdown(value);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
        return value
            .map(item => formatPLUValue(item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, val]) => `${key}: ${formatPLUValue(val)}`)
            .filter(Boolean)
            .join(' • ');
    }
    return String(value);
};

export const normalizePLUAnalysis = (payload = {}) => {
    const toText = (val, fallback = 'à vérifier') => {
        const text = formatPLUValue(val);
        return text || fallback;
    };

    const toArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) {
            return val.map(item => formatPLUValue(item)).filter(Boolean);
        }
        const text = formatPLUValue(val);
        return text ? [text] : [];
    };

    return {
        zone: toText(payload.zone_urba, payload.zone),
        zone_description: toText(payload.zone_description, toText(payload.regles_principales, 'Information à confirmer auprès du service urbanisme')),
        hauteur_max: toText(payload.hauteur_max),
        emprise_sol: toText(payload.emprise_sol, payload.emprise_max),
        retraits: toText(payload.retraits),
        stationnement: toText(payload.stationnement),
        espaces_verts: toText(payload.espaces_verts),
        documents_reference: toArray(payload.documents_reference),
        risques: toArray(payload.risques),
        cautions: toArray(payload.cautions),
        recommandations: toArray(payload.recommandations),
        observations: toText(payload.observations, toText(payload.recommandations, 'Consulter le PLU communal pour confirmation.')),
        demarche_admin: toText(payload.demarche_admin, 'À déterminer selon la surface du projet'),
        sources_consultees: toArray(payload.sources_consultees),
        analyse_detaillee: payload.analyse_detaillee || null,
    };
};
