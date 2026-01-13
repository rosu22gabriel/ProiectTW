const { attachmentsModel } = require('../models/attachments-model');
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

function serializeAttachment(attachment) {
    const data = attachment.toJSON();
    if (data.data) {
        data.data = data.data.toString('base64');
    }
    return data;
}

// Creeaza un atasament nou
async function createAttachment(req, res) {
    try {
        const { filename, mimeType, dataBase64, noteId } = req.body || {};
        if (!filename || !mimeType || !dataBase64 || !noteId) {
            return res.status(400).json({ message: 'filename, mimeType, dataBase64 si noteId sunt obligatorii.' });
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
            return res.status(403).json({ message: 'Nu aveti dreptul sa adaugati atasamente la aceasta notita.' });
        }

        const data = Buffer.from(dataBase64, 'base64');
        const attachment = await createElement(attachmentsModel, { filename, mimeType, data, noteId });
        return res.status(201).json(serializeAttachment(attachment));
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut crea atasamentul.', error: error.message });
    }
}

// Returneaza toate atasamentele
async function getAttachments(req, res) {
    try {
        const attachments = await getAllElements(attachmentsModel);
        return res.status(200).json(attachments.map(serializeAttachment));
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-au putut obtine atasamentele.', error: error.message });
    }
}

// Returneaza un atasament dupa id
async function getAttachmentById(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul atasamentului este invalid.' });
        }

        const attachment = await getElementById(attachmentsModel, id);
        if (!attachment) {
            return res.status(404).json({ message: 'Atasamentul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await getElementById(noteModel, attachment.noteId);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti acces la acest atasament.' });
        }

        return res.status(200).json(serializeAttachment(attachment));
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut obtine atasamentul.', error: error.message });
    }
}

// Actualizeaza datele unui atasament
async function updateAttachment(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul atasamentului este invalid.' });
        }

        const attachment = await getElementById(attachmentsModel, id);
        if (!attachment) {
            return res.status(404).json({ message: 'Atasamentul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const currentNote = await getElementById(noteModel, attachment.noteId);
        if (!currentNote) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        if (currentNote.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa modificati acest atasament.' });
        }

        const { filename, mimeType, dataBase64, noteId } = req.body || {};
        if (noteId && noteId !== attachment.noteId) {
            const targetNote = await getElementById(noteModel, noteId);
            if (!targetNote) {
                return res.status(404).json({ message: 'Notita nu a fost gasita.' });
            }
            if (targetNote.userId !== userId) {
                return res.status(403).json({ message: 'Nu aveti dreptul sa mutati atasamentul la aceasta notita.' });
            }
        }

        const updatePayload = {};
        if (filename !== undefined) updatePayload.filename = filename;
        if (mimeType !== undefined) updatePayload.mimeType = mimeType;
        if (dataBase64 !== undefined) updatePayload.data = Buffer.from(dataBase64, 'base64');
        if (noteId !== undefined) updatePayload.noteId = noteId;

        const updatedAttachment = await updateElement(attachmentsModel, id, updatePayload);

        if (!updatedAttachment) {
            return res.status(404).json({ message: 'Atasamentul nu a fost gasit.' });
        }

        return res.status(200).json(serializeAttachment(updatedAttachment));
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut actualiza atasamentul.', error: error.message });
    }
}

// Sterge un atasament
async function deleteAttachment(req, res) {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'ID-ul atasamentului este invalid.' });
        }

        const attachment = await getElementById(attachmentsModel, id);
        if (!attachment) {
            return res.status(404).json({ message: 'Atasamentul nu a fost gasit.' });
        }

        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Utilizator neautentificat.' });
        }

        const note = await getElementById(noteModel, attachment.noteId);
        if (!note) {
            return res.status(404).json({ message: 'Notita nu a fost gasita.' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'Nu aveti dreptul sa stergeti acest atasament.' });
        }

        const deleted = await deleteElement(attachmentsModel, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Atasamentul nu a fost gasit.' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Nu s-a putut sterge atasamentul.', error: error.message });
    }
}

module.exports = {
    createAttachment,
    getAttachments,
    getAttachmentById,
    updateAttachment,
    deleteAttachment,
};
