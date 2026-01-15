const express = require('express');
const router = express.Router();
const {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
} = require('../controllers/subjects-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['name']), createSubject);
router.get('/', requireAuth, getSubjects);
router.get('/:id', requireAuth, getSubjectById);
router.put('/:id', requireAuth, requireAtLeastOneField(['name']), updateSubject);
router.delete('/:id', requireAuth, deleteSubject);

module.exports = router;
