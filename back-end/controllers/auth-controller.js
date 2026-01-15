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
        console.log('[auth][register] attempt', { username, email });
        if (!username || !email || !password) {
            console.log('[auth][register] missing fields');
            return res.status(400).json({ message: 'username, email si password sunt obligatorii.' });
        }

        if (!isInstitutionalEmail(email)) {
            console.log('[auth][register] invalid email domain', email);
            return res.status(400).json({ message: 'Emailul trebuie sa fie institutional (@stud.ase.ro).' });
        }

        const existing = await userModel.findOne({ where: { email } });
        if (existing) {
            console.log('[auth][register] email already exists', email);
            return res.status(409).json({ message: 'Exista deja un utilizator cu acest email.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            email,
            passwordHash,
            role: 'reader',
        });

        console.log('[auth][register] success', { userId: user.userId, email: user.email });
        return res.status(201).json(sanitizeUser(user));
    } catch (error) {
        console.log('[auth][register] error', error.message);
        return res.status(500).json({ message: 'Nu s-a putut crea contul.', error: error.message });
    }
}

// Autentificare utilizator
async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        console.log('[auth][login] attempt', { email });
        if (!email || !password) {
            console.log('[auth][login] missing fields');
            return res.status(400).json({ message: 'email si password sunt obligatorii.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.log('[auth][login] missing JWT_SECRET');
            return res.status(500).json({ message: 'JWT_SECRET lipseste din variabilele de mediu.' });
        }

        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            console.log('[auth][login] user not found', email);
            return res.status(401).json({ message: 'Credentiale invalide.' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            console.log('[auth][login] invalid password', email);
            return res.status(401).json({ message: 'Credentiale invalide.' });
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            jwtSecret,
            { expiresIn: JWT_EXPIRATION }
        );

        console.log('[auth][login] success', { userId: user.userId, email: user.email });
        return res.status(200).json({ token, user: sanitizeUser(user) });
    } catch (error) {
        console.log('[auth][login] error', error.message);
        return res.status(500).json({ message: 'Nu s-a putut face autentificarea.', error: error.message });
    }
}

module.exports = {
    register,
    login,
    async getMe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Utilizator neautentificat.' });
            }
            const user = await userModel.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
            }
            return res.status(200).json(sanitizeUser(user));
        } catch (error) {
            console.log('[auth][me] error', error.message);
            return res.status(500).json({ message: 'Nu s-a putut obtine profilul.', error: error.message });
        }
    },
};
