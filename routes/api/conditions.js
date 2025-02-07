const express = require('express');
const router = express.Router();
const conditionsController = require('../../controllers/conditionsController');
const { checkAPIAccess } = require('../../controllers/auth/checkAPIAccess');


router.route('/')
    .get(conditionsController.getAllConditions)
    
    .post(conditionsController.addCondition);


    
router.route('/:id')
.get(checkAPIAccess, conditionsController.getConditionById)
.put(conditionsController.updateCondition)
.delete(conditionsController.deleteCondition);
    
router.route('/:id/limited')
.get(conditionsController.getLimitedConditionById)

 router.route('/:id/:type')
    .get(checkAPIAccess, conditionsController.getChildConditionsByType)
module.exports = router;


