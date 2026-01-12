const { userModel } = require('../models/users-model');
const {
    createElement,
    getAllElements,
    getElementById,
    updateElement,
    deleteElement,
} = require('../db/db-utils');

// Converteste id-ul la numar si valideaza formatul
function parseId(value) {
    const id = Number.parseInt(value, 10);
    return Number.isNaN(id) ? null : id;
}

// Creeaza un utilizator nou
async function createUser(req, res) {
    try {
        const { username, email, passwordHash, role } = req.body || {};
        if (!username || !email || !passwordHash) {
            return res.status(400).json({ message: 'username, email si passwordHash sunt obligatorii.' });
        }

        const user = await createElement(userModel, { username, email, passwordHash, role });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea utilizatorul.', error: error.message });
    }
}

// Returneaza toti utilizatorii
async function getUsers(req, res) {
    try {
        const users = await getAllElements(userModel);
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine utilizatorii.', error: error.message });
    }
}

// Returneaza un utilizator dupa id
async function getUserById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul utilizatorului este invalid.' });
        }

        const user = await getElementById(userModel, id);
        if (!user) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine utilizatorul.', error: error.message });
    }
}

// Actualizeaza datele unui utilizator
async function updateUser(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul utilizatorului este invalid.' });
        }

        const { username, email, passwordHash, role } = req.body || {};
        const updatedUser = await updateElement(userModel, id, { username, email, passwordHash, role });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza utilizatorul.', error: error.message });
    }
}

// Sterge un utilizator
async function deleteUser(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul utilizatorului este invalid.' });
        }

        const deleted = await deleteElement(userModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge utilizatorul.', error: error.message });
    }
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};
