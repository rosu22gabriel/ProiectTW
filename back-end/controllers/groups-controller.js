const { groupModel } = require('../models/groups-model');
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

// Creeaza un grup nou
async function createGroup(req, res) {
    try {
        const { name } = req.body || {};
        if (!name) {
            return res.status(400).json({ message: 'name este obligatoriu.' });
        }

        const ownerId = req.user?.userId;
        if (!ownerId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const group = await createElement(groupModel, { name, ownerId });
        return res.status(201).json(group);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea grupul.', error: error.message });
    }
}

// Returneaza toate grupurile
async function getGroups(req, res) {
    try {
        const groups = await getAllElements(groupModel);
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine grupurile.', error: error.message });
    }
}

// Returneaza un grup dupa id
async function getGroupById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti acces la acest grup.' });
        }

        return res.status(200).json(group);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine grupul.', error: error.message });
    }
}

// Actualizeaza datele unui grup
async function updateGroup(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa modificati acest grup.' });
        }

        const { name } = req.body || {};
        const updatedGroup = await updateElement(groupModel, id, { name });

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        return res.status(200).json(updatedGroup);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza grupul.', error: error.message });
    }
}

// Sterge un grup
async function deleteGroup(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul grupului este invalid.' });
        }

        const group = await getElementById(groupModel, id);
        if (!group) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (group.ownerId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa stergeti acest grup.' });
        }

        const deleted = await deleteElement(groupModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Grupul nu a fost gasit.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge grupul.', error: error.message });
    }
}

module.exports = {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
};
