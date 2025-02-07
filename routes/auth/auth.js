const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');

router.post('/', authController.handleLogin);

router.get('/checkLoggedIn', authController.checkLoggedIn);

module.exports = router;