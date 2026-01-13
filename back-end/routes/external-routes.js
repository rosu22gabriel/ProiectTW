const express = require('express');
const router = express.Router();
const { fetchWikipediaSummary } = require('../controllers/external-controller');

router.get('/wikipedia', fetchWikipediaSummary);

module.exports = router;
