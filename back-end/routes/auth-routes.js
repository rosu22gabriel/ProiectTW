const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth-controller');
const { requireBodyFields } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

router.post('/register', requireBodyFields(['username', 'email', 'password']), register);
router.post('/login', requireBodyFields(['email', 'password']), login);
router.get('/me', requireAuth, getMe);

module.exports = router;
