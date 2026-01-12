const express = require('express');
const router = express.Router();
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/users-controller');
const { requireBodyFields, requireAtLeastOneField } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, requireBodyFields(['username', 'email', 'passwordHash']), createUser);
router.get('/', requireAuth, getUsers);
router.get('/:id', requireAuth, getUserById);
router.put('/:id', requireAuth, requireAtLeastOneField(['username', 'email', 'passwordHash', 'role']), updateUser);
router.delete('/:id', requireAuth, deleteUser);

module.exports = router;
