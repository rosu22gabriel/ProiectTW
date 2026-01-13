const { Op } = require('sequelize');
const { noteModel } = require('../models/notes-model');
const { userModel } = require('../models/users-model');
const { tagModel } = require('../models/tags-model');
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

// Creeaza o notita noua
async function createNote(req, res) {
    try {
        const { title, content, subjectId, tagIds } = req.body || {};
        if (!title || !content) {
            return res.status(400).json({ message: 'title si content sunt obligatorii.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await createElement(noteModel, { title, content, userId, subjectId });
        if (Array.isArray(tagIds) && tagIds.length > 0) {
            const ids = tagIds.map((value) => parseId(value)).filter(Boolean);
            if (ids.length > 0) {
                const tags = await tagModel.findAll({ where: { tagId: { [Op.in]: ids } } });
                if (tags.length > 0) {
                    await note.addTags(tags);
                }
            }
        }
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

        const where = { userId };
        const include = [];

        if (req.query.subjectId) {
            const subjectId = parseId(req.query.subjectId);
            if (!subjectId) {
                return res.status(400).json({ message: 'ID-ul materiei este invalid.' });
            }
            where.subjectId = subjectId;
        }

        if (req.query.tagId) {
            const tagId = parseId(req.query.tagId);
            if (!tagId) {
                return res.status(400).json({ message: 'ID-ul etichetei este invalid.' });
            }
            include.push({
                model: tagModel,
                as: 'tags',
                where: { tagId },
                through: { attributes: [] },
            });
        }

        if (req.query.q) {
            const query = String(req.query.q).trim();
            if (query) {
                where.title = { [Op.like]: `%${query}%` };
            }
        }

        if (req.query.includeSubject === 'true') {
            include.push({
                model: subjectModel,
            });
        }

        const notes = await noteModel.findAll({ where, include });
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

// Partajeaza o notita cu un alt utilizator
async function shareNote(req, res) {
    try {
        const noteId = parseId(req.params.id);
        if (!noteId) {
            return res.status(400).json({ message: 'ID-ul notitei este invalid.' });
        }

        const { sharedWithUserId } = req.body || {};
        if (!sharedWithUserId) {
            return res.status(400).json({ message: 'sharedWithUserId este obligatoriu.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await getElementById(noteModel, noteId);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa partajati aceasta notita.' });
        }

        if (Number(sharedWithUserId) === Number(userId)) {
            return res.status(400).json({ message: 'Nu puteti partaja notita cu acelasi utilizator.' });
        }

        const targetUser = await getElementById(userModel, sharedWithUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        await note.addUser(targetUser);
        return res.status(201).json({ message: 'Notita a fost partajata cu succes.' });
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut partaja notita.', error: error.message });
    }
}

// Returneaza notitele partajate cu utilizatorul autentificat
async function getSharedNotes(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const user = await getElementById(userModel, userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        const sharedNotes = await user.getSharedNotes();
        return res.status(200).json(sharedNotes);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine notitele partajate.', error: error.message });
    }
}

// Returneaza notitele partajate de utilizatorul autentificat
async function getSharedByMe(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const notes = await noteModel.findAll({
            where: { userId },
            include: [
                {
                    model: userModel,
                    through: { attributes: [] },
                },
            ],
        });

        const sharedByMe = notes.filter((note) => note.users && note.users.length > 0);
        return res.status(200).json(sharedByMe);
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine notitele partajate de dvs.', error: error.message });
    }
}

// Revoca partajarea unei notite cu un utilizator
async function revokeShare(req, res) {
    try {
        const noteId = parseId(req.params.id);
        if (!noteId) {
            return res.status(400).json({ message: 'ID-ul notitei este invalid.' });
        }

        const targetUserId = parseId(req.params.userId);
        if (!targetUserId) {
            return res.status(400).json({ message: 'ID-ul utilizatorului este invalid.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await getElementById(noteModel, noteId);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa revocati partajarea.' });
        }

        const targetUser = await getElementById(userModel, targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        await note.removeUser(targetUser);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut revoca partajarea.', error: error.message });
    }
}

module.exports = {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    shareNote,
    getSharedNotes,
    getSharedByMe,
    revokeShare,
};
