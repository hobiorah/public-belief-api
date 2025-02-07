const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/eventController');
const { checkAPIAccess, validateCookie } = require('../../controllers/auth/checkAPIAccess');



router.post('/addEvent', eventController.addEvent);
router.post('/createNotification', eventController.createNotification);





// router.post('/user', registerController.createNewUser);
//  router.get('/:username', userController.getUserDetails);


module.exports = router;