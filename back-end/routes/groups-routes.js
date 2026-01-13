const express = require('express');
const router = express.Router();
const {
    createGroup,
    getGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
} = require('../controllers/groups-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['name']), createGroup);
router.get('/', requireAuth, getGroups);
router.get('/:id', requireAuth, getGroupById);
router.put('/:id', requireAuth, requireAtLeastOneField(['name']), updateGroup);
router.delete('/:id', requireAuth, deleteGroup);
router.get('/:id/members', requireAuth, getGroupMembers);
router.post('/:id/members', requireAuth, requireAtLeastOneField(['userId', 'email']), addGroupMember);
router.post('/:id/invite', requireAuth, requireAtLeastOneField(['userId', 'email']), addGroupMember);
router.delete('/:id/members/:userId', requireAuth, removeGroupMember);

module.exports = router;
