const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/auth/registerController');

router.post('/admin', registerController.handleNewAdmin);
router.post('/user', registerController.createNewUser);
router.get('/user/:username', registerController.getUserDetails);


module.exports = router;