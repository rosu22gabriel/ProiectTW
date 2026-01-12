// Middleware-uri simple de validare pentru request-uri

function getMissingFields(body, fields) {
    if (!body || typeof body !== 'object') return fields;
    return fields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
}

function requireBodyFields(fields) {
    return (req, res, next) => {
        const missing = getMissingFields(req.body, fields);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Campuri lipsa: ${missing.join(', ')}` });
        }
        return next();
    };
}

function requireAtLeastOneField(fields) {
    return (req, res, next) => {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ message: 'Corpul cererii este invalid.' });
        }
        const hasAny = fields.some(field => req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '');
        if (!hasAny) {
            return res.status(400).json({ message: `Trebuie furnizat cel putin unul dintre: ${fields.join(', ')}` });
        }
        return next();
    };
}

module.exports = {
    requireBodyFields,
    requireAtLeastOneField,
};
