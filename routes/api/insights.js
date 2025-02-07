const express = require('express');
const router = express.Router();
const insightsController = require('../../controllers/insightsController');


router.route('/')
    .post(insightsController.addInsight)
     .get(insightsController.getAllInsights);
     router.route('/tags')
     .get(insightsController.getAllUniqueTags);
        
 router.route('/:insightId')
 .get(insightsController.getInsightById)
 .put(insightsController.updateInsight)
 .delete(insightsController.deleteInsight);


    

module.exports = router;