const express = require('express');
const router = express.Router();
const commentsController = require('../../../controllers/forum/commentsController');


router.route('/post/:postId/:commentId')
    .get(commentsController.getPostComments)

router.route('/post/:postId/')
    .get(commentsController.getPostComments)

router.route('/post/:postId/createComment')
    .post(commentsController.createComment)

router.route('/post/:postId/createReplyComment/:parentCommnentId')
    .post(commentsController.createComment)

//non posts



router.route('/nonpost/:objectId/:commentId')
    .get(commentsController.getNonPostComments)

router.route('/nonpost/:objectId/')
    .get(commentsController.getNonPostComments)

router.route('/nonpost/:objectType/:objectId/createComment')
    .post(commentsController.createNonPostComment)

router.route('/nonpost/:objectType/:objectId/createReplyComment/:parentCommnentId')
    .post(commentsController.createNonPostComment)

    // router.route('/:objectType/:objectId/post/:postId/comments')
    // .get(postsController.getCommentsForThisPost)
//     .post(beliefsController.addBelief)
    

    
// router.route('/:id')
// .get(beliefsController.getBeliefById)
// .put(beliefsController.updateBelief)
// .delete(beliefsController.deleteBelief);

// router.route('/condition/:conditionId')
// .get(beliefsController.getBeliefByCondition);
    

module.exports = router;