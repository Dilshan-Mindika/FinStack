const AccountModel = require('../models/accountModel');

class AccountController {
    static async getAccounts(req, res) {
        try {
            const accounts = await AccountModel.findByBookId(req.params.bookId);
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AccountController;
