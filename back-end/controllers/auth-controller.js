const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userModel } = require('../models/users-model');

const JWT_EXPIRATION = '1h';

// Verifica daca emailul este institutional
function isInstitutionalEmail(email) {
    return typeof email === 'string' && email.toLowerCase().endsWith('@stud.ase.ro');
}

function sanitizeUser(user) {
    const data = user.toJSON();
    delete data.passwordHash;
    return data;
}

// Inregistrare utilizator nou
async function register(req, res) {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email si password sunt obligatorii.' });
        }

        if (!isInstitutionalEmail(email)) {
            return res.status(400).json({ message: 'Emailul trebuie sa fie institutional (@stud.ase.ro).' });
        }

        const existing = await userModel.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'Exista deja un utilizator cu acest email.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            email,
            passwordHash,
            role: 'reader',
        });

        return res.status(201).json(sanitizeUser(user));
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea contul.', error: error.message });
    }
}

// Autentificare utilizator
async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: 'email si password sunt obligatorii.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT_SECRET lipseste din variabilele de mediu.' });
        }

        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credentiale invalide.' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Credentiale invalide.' });
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            jwtSecret,
            { expiresIn: JWT_EXPIRATION }
        );

        return res.status(200).json({ token, user: sanitizeUser(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut face autentificarea.', error: error.message });
    }
}

module.exports = {
    register,
    login,
};
