const express = require('express');
const BookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.protect, BookController.createBook);
router.get('/organization/:orgId', authMiddleware.protect, BookController.getBooksByOrg);
router.get('/:bookId/settings', authMiddleware.protect, BookController.getBookSettings);
router.put('/:bookId/settings', authMiddleware.protect, BookController.updateBookSettings);

module.exports = router;
