const express = require('express');
const router = express.Router();

const notaryPublicController = require('../controllers/notaryPublicController');

router.get('/notary-public', notaryPublicController.notaryPublic);

module.exports = router;
