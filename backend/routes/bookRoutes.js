const express = require('express');
const BookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.protect, BookController.createBook);
router.get('/organization/:orgId', authMiddleware.protect, BookController.getBooksByOrg);

module.exports = router;
