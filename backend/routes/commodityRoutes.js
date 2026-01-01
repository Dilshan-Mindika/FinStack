const express = require('express');
const CommodityController = require('../controllers/commodityController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get list of standard currencies (Public or Auth protected)
router.get('/standard', authMiddleware.protect, CommodityController.getStandardCurrencies);

// CRUD
router.post('/', authMiddleware.protect, CommodityController.createCommodity);
router.get('/book/:bookId', authMiddleware.protect, CommodityController.getBookCommodities);

module.exports = router;
