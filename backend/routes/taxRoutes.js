const express = require('express');
const TaxController = require('../controllers/taxController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/book/:bookId', authMiddleware.protect, TaxController.getTaxTables);
router.post('/', authMiddleware.protect, TaxController.createTaxTable);

module.exports = router;
