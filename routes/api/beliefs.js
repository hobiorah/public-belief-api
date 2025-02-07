const express = require('express');
const router = express.Router();
const beliefsController = require('../../controllers/beliefsController');


router.route('/')
    .get(beliefsController.getAllBeliefs)
    .post(beliefsController.addBelief)
    

    
router.route('/:id')
.get(beliefsController.getBeliefById)
.put(beliefsController.updateBelief)
.delete(beliefsController.deleteBelief);

router.route('/condition/:conditionId')
.get(beliefsController.getBeliefByCondition);
    

module.exports = router;