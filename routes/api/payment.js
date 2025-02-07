const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const bodyParser = require('body-parser');

console.log(bodyParser)


// router.post('/webhook', paymentController.webhook);
// Use body-parser to retrieve the raw body as a buffer

router.post('/confirmPaymentWebhook', bodyParser.raw({type: 'application/json'}), paymentController.confirmPaymentWebhook);

router.post('/createCheckoutSession',express.json(), paymentController.createCheckoutSession);
router.post('/createSubscriptionPortal',express.json(), paymentController.createSubscriptionPortal);
router.post('/createSubscriptionCheckout',express.json(), paymentController.createSubscriptionCheckout);






// router.post('/user', registerController.createNewUser);
//  router.get('/:username', userController.getUserDetails);


module.exports = router;