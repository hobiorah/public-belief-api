const express = require('express');
const router = express.Router();
const loadedWordsController = require('../../controllers/loadedWordsController');


router.route('/')
    .get(loadedWordsController.getAllLoadedWords)
    .post(loadedWordsController.addLoadedWord)
    .delete(loadedWordsController.deleteLoadedWord);


    
router.route('/:id')
.get(loadedWordsController.getLoadedWordById)
.put(loadedWordsController.updateLoadedWord)
.delete(loadedWordsController.deleteLoadedWord);
    

module.exports = router;
