// routes/worksRoutes.js
const express = require('express');
const router = express.Router();
const worksController = require('../controllers/user_controller.js');

// POST request to register a new work
router.post('/register', worksController.registerWork);

// GET request to fetch all works for a specific wallet
router.get('/:walletId', worksController.getWorksByWallet);

// GET request to fetch all works (Admin endpoint)
router.get('/all', worksController.getAllWorks); 

module.exports = router;