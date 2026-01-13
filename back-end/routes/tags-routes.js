const express = require('express');
const router = express.Router();
const {
    createTag,
    getTags,
    getTagById,
    updateTag,
    deleteTag,
} = require('../controllers/tags-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['name']), createTag);
router.get('/', requireAuth, getTags);
router.get('/:id', requireAuth, getTagById);
router.put('/:id', requireAuth, requireAtLeastOneField(['name']), updateTag);
router.delete('/:id', requireAuth, deleteTag);

module.exports = router;
