const express = require('express');
const router = express.Router();
const {
    createAttachment,
    getAttachments,
    getAttachmentsMetadata,
    getAttachmentById,
    downloadAttachment,
    updateAttachment,
    deleteAttachment,
} = require('../controllers/attachments-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['filename', 'mimeType', 'dataBase64', 'noteId']), createAttachment);
router.get('/', requireAuth, getAttachments);
router.get('/metadata', requireAuth, getAttachmentsMetadata);
router.get('/:id/download', requireAuth, downloadAttachment);
router.get('/:id', requireAuth, getAttachmentById);
router.put('/:id', requireAuth, requireAtLeastOneField(['filename', 'mimeType', 'dataBase64', 'noteId']), updateAttachment);
router.delete('/:id', requireAuth, deleteAttachment);

module.exports = router;
