const express = require('express');
const router = express.Router();
const logoutController = require('../../controllers/auth/logoutController');

//uses cookie to logout. finds user with the refresh token inside cookie
router.get('/', logoutController.handleLogout);

module.exports = router;