const { subjectModel } = require('../models/subjects-model');
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

// Creeaza o materie noua
async function createSubject(req, res) {
    try {
        const { name, description } = req.body || {};
        if (!name || !description) {
            return res.status(400).json({ message: 'name si description sunt obligatorii.' });
        }

        const subject = await createElement(subjectModel, { name, description });
        return res.status(201).json(subject);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea materia.', error: error.message });
    }
}

// Returneaza toate materiile
async function getSubjects(req, res) {
    try {
        const subjects = await getAllElements(subjectModel);
        return res.status(200).json(subjects);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine materiile.', error: error.message });
    }
}

// Returneaza o materie dupa id
async function getSubjectById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul materiei este invalid.' });
        }

        const subject = await getElementById(subjectModel, id);
        if (!subject) {
            return res.status(404).json({ message: 'Materia nu a fost gasita.' });
        }

        return res.status(200).json(subject);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine materia.', error: error.message });
    }
}

// Actualizeaza datele unei materii
async function updateSubject(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul materiei este invalid.' });
        }

        const { name, description } = req.body || {};
        const updatedSubject = await updateElement(subjectModel, id, { name, description });

        if (!updatedSubject) {
            return res.status(404).json({ message: 'Materia nu a fost gasita.' });
        }

        return res.status(200).json(updatedSubject);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza materia.', error: error.message });
    }
}

// Sterge o materie
async function deleteSubject(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul materiei este invalid.' });
        }

        const deleted = await deleteElement(subjectModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Materia nu a fost gasita.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge materia.', error: error.message });
    }
}

module.exports = {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
};
