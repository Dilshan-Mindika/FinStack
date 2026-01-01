const CommodityModel = require('../models/commodityModel');

// Standard Currencies Data (Simple subset for MVP)
const STANDARD_CURRENCIES = [
    { namespace: 'ISO4217', mnemonic: 'USD', fullname: 'United States Dollar', fraction: 100 },
    { namespace: 'ISO4217', mnemonic: 'EUR', fullname: 'Euro', fraction: 100 },
    { namespace: 'ISO4217', mnemonic: 'GBP', fullname: 'Pound Sterling', fraction: 100 },
    { namespace: 'ISO4217', mnemonic: 'JPY', fullname: 'Japanese Yen', fraction: 1 },
    { namespace: 'ISO4217', mnemonic: 'CAD', fullname: 'Canadian Dollar', fraction: 100 },
    { namespace: 'ISO4217', mnemonic: 'AUD', fullname: 'Australian Dollar', fraction: 100 },
    { namespace: 'ISO4217', mnemonic: 'LKR', fullname: 'Sri Lankan Rupee', fraction: 100 },
];

class CommodityController {
    static async getStandardCurrencies(req, res) {
        // Return JSON of standard currencies so frontend can select them
        res.json(STANDARD_CURRENCIES);
    }

    static async createCommodity(req, res) {
        try {
            const commodity = await CommodityModel.create(req.body);
            res.status(201).json(commodity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBookCommodities(req, res) {
        try {
            const commodities = await CommodityModel.findByBookId(req.params.bookId);
            res.json(commodities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CommodityController;
