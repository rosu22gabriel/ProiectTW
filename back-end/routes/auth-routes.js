const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth-controller');
const { requireBodyFields } = require('../middlewares/validation');

router.post('/register', requireBodyFields(['username', 'email', 'password']), register);
router.post('/login', requireBodyFields(['email', 'password']), login);

module.exports = router;
