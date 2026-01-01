const express = require('express');
const AccountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/book/:bookId', authMiddleware.protect, AccountController.getAccounts);

module.exports = router;
