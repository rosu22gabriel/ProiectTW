const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
} = require('../controllers/groups-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['name']), createGroup);
router.get('/', requireAuth, getGroups);
router.get('/:id', requireAuth, getGroupById);
router.put('/:id', requireAuth, requireAtLeastOneField(['name']), updateGroup);
router.delete('/:id', requireAuth, deleteGroup);

module.exports = router;
