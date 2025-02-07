const express = require('express');
const router = express.Router();
const userController = require('../../controllers/auth/userController');

router.post('/addPurchasedObject', userController.addPurchaedObject);
// router.post('/user', registerController.createNewUser);
 router.get('/:username', userController.getUserDetails);
 router.get('/access/:type', userController.getAccessData);



module.exports = router;