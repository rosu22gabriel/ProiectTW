const { tagModel } = require('../models/tags-model');
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

// Creeaza o eticheta noua
async function createTag(req, res) {
    try {
        const { name } = req.body || {};
        if (!name) {
            return res.status(400).json({ message: 'name este obligatoriu.' });
        }

        const tag = await createElement(tagModel, { name });
        return res.status(201).json(tag);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea eticheta.', error: error.message });
    }
}

// Returneaza toate etichetele
async function getTags(req, res) {
    try {
        const tags = await getAllElements(tagModel);
        return res.status(200).json(tags);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine etichetele.', error: error.message });
    }
}

// Returneaza o eticheta dupa id
async function getTagById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul etichetei este invalid.' });
        }

        const tag = await getElementById(tagModel, id);
        if (!tag) {
            return res.status(404).json({ message: 'Eticheta nu a fost gasita.' });
        }

        return res.status(200).json(tag);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine eticheta.', error: error.message });
    }
}

// Actualizeaza datele unei etichete
async function updateTag(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul etichetei este invalid.' });
        }

        const { name } = req.body || {};
        const updatedTag = await updateElement(tagModel, id, { name });

        if (!updatedTag) {
            return res.status(404).json({ message: 'Eticheta nu a fost gasita.' });
        }

        return res.status(200).json(updatedTag);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza eticheta.', error: error.message });
    }
}

// Sterge o eticheta
async function deleteTag(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul etichetei este invalid.' });
        }

        const deleted = await deleteElement(tagModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Eticheta nu a fost gasita.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge eticheta.', error: error.message });
    }
}

module.exports = {
    createTag,
    getTags,
    getTagById,
    updateTag,
    deleteTag,
};
