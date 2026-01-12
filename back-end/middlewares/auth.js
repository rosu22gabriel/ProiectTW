const jwt = require('jsonwebtoken');

// Verifica token-ul JWT si ataseaza utilizatorul decodat pe req
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Lipseste token-ul de autentificare.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ message: 'JWT_SECRET lipseste din variabilele de mediu.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid sau expirat.' });
    }
}

module.exports = {
    requireAuth,
};
