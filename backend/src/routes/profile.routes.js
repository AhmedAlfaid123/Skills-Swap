const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/show', profileController.show);
router.put('/update', profileController.updateUser);
router.put('/updateSkills', profileController.updateSkills);

module.exports = router;