const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');
 

 
// 
router.get('/users', discoveryController.getAllUsers);
 
//
router.get('/users/search', discoveryController.searchBySkill);
 
//
router.get('/users/filter', discoveryController.filterByTrack);
 
// 
router.get('/users/:userId', discoveryController.getUserById);
 
module.exports = router;