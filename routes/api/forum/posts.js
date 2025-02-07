const express = require('express');
const router = express.Router();
const postsController = require('../../../controllers/forum/postsController');
const { checkAPIAccess } = require('../../../controllers/auth/checkAPIAccess');


router.route('/:objectType/:objectId')
    .get(checkAPIAccess, postsController.getPostsforThisObject)

    router.route('/:postId')
    .get(postsController.getPost)

    // router.route('/:objectType/:objectId/post/:postId/comments')
    // .get(postsController.getCommentsForThisPost)
router.route('/:objectType/:objectId/createPost')
    .post(postsController.createPost)
    

    
// router.route('/:id')
// .get(beliefsController.getBeliefById)
// .put(beliefsController.updateBelief)
// .delete(beliefsController.deleteBelief);

// router.route('/condition/:conditionId')
// .get(beliefsController.getBeliefByCondition);
    

module.exports = router;