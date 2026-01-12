const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
} = require('../controllers/notes-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['title', 'content']), createNote);
router.get('/', requireAuth, getNotes);
router.get('/:id', requireAuth, getNoteById);
router.put('/:id', requireAuth, requireAtLeastOneField(['title', 'content', 'subjectId']), updateNote);
router.delete('/:id', requireAuth, deleteNote);

module.exports = router;
