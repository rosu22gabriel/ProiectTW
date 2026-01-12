const express = require('express');
const router = express.Router();
const {
    createAttachment,
    getAttachments,
    getAttachmentById,
    updateAttachment,
    deleteAttachment,
} = require('../controllers/attachments-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['filePath', 'noteId']), createAttachment);
router.get('/', requireAuth, getAttachments);
router.get('/:id', requireAuth, getAttachmentById);
router.put('/:id', requireAuth, requireAtLeastOneField(['filePath', 'noteId']), updateAttachment);
router.delete('/:id', requireAuth, deleteAttachment);

module.exports = router;
