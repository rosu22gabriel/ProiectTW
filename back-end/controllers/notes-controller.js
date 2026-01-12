const { noteModel } = require('../models/notes-model');
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

// Creeaza o notita noua
async function createNote(req, res) {
    try {
        const { title, content, subjectId } = req.body || {};
        if (!title || !content) {
            return res.status(400).json({ message: 'title si content sunt obligatorii.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await createElement(noteModel, { title, content, userId, subjectId });
        return res.status(201).json(note);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea notita.', error: error.message });
    }
}

// Returneaza toate notitele
async function getNotes(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const notes = await noteModel.findAll({ where: { userId } });
        return res.status(200).json(notes);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine notitele.', error: error.message });
    }
}

// Returneaza o notita dupa id
async function getNoteById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul notitei este invalid.' });
        }

        const note = await getElementById(noteModel, id);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti acces la aceasta notita.' });
        }

        return res.status(200).json(note);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine notita.', error: error.message });
    }
}

// Actualizeaza datele unei notite
async function updateNote(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul notitei este invalid.' });
        }

        const note = await getElementById(noteModel, id);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa modificati aceasta notita.' });
        }

        const { title, content, subjectId } = req.body || {};
        const updatedNote = await updateElement(noteModel, id, { title, content, subjectId });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        return res.status(200).json(updatedNote);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza notita.', error: error.message });
    }
}

// Sterge o notita
async function deleteNote(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul notitei este invalid.' });
        }

        const note = await getElementById(noteModel, id);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa stergeti aceasta notita.' });
        }

        const deleted = await deleteElement(noteModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge notita.', error: error.message });
    }
}

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
};
