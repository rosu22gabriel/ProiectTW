const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    shareNote,
    getSharedNotes,
    getSharedByMe,
    revokeShare,
} = require('../controllers/notes-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['title', 'content']), createNote);
router.get('/', requireAuth, getNotes);
router.get('/shared', requireAuth, getSharedNotes);
router.get('/shared-by-me', requireAuth, getSharedByMe);
router.get('/:id', requireAuth, getNoteById);
router.put('/:id', requireAuth, requireAtLeastOneField(['title', 'content', 'subjectId']), updateNote);
router.delete('/:id', requireAuth, deleteNote);
router.post('/:id/share', requireAuth, requireAtLeastOneField(['sharedWithUserId', 'email']), shareNote);
router.delete('/:id/share/:userId', requireAuth, revokeShare);

module.exports = router;
