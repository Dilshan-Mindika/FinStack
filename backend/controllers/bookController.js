const BookModel = require('../models/bookModel');
const CommodityModel = require('../models/commodityModel');
const AccountModel = require('../models/accountModel');
const BookSettingsModel = require('../models/bookSettingsModel');
const db = require('../db');

class BookController {
    static async createBook(req, res) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const { organization_id, name, description, fiscal_year_start, currency } = req.body;
            // currency object expected: { mnemonic: 'USD', fullname: 'US Dollar', ... } or just code/id if using standard list

            // 1. Create Book
            const bookQuery = `
                INSERT INTO "Book" (organization_id, name, description, fiscal_year_start, settings)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const bookRes = await client.query(bookQuery, [organization_id, name, description, fiscal_year_start, "{}"]);
            const book = bookRes.rows[0];

            // 2. Create Default Currency for this Book
            // If currency is passed as a full object
            const commodityQuery = `
                INSERT INTO "Commodity" (book_id, namespace, mnemonic, fullname, fraction, quote_source)
                VALUES ($1, 'CURRENCY', $2, $3, $4, 'CURRENCY')
                RETURNING *
            `;
            const commodityRes = await client.query(commodityQuery, [
                book.id,
                currency.mnemonic || 'USD',
                currency.fullname || 'US Dollar',
                currency.fraction || 100
            ]);
            const baseCurrency = commodityRes.rows[0];

            // 3. Create Root Account
            const rootAccountQuery = `
                 INSERT INTO "Account" (book_id, name, type, commodity_id, placeholder, hidden)
                 VALUES ($1, 'Root Account', 'ROOT', $2, true, true)
                 RETURNING *
            `;
            const rootAccountRes = await client.query(rootAccountQuery, [book.id, baseCurrency.id]);
            const rootAccount = rootAccountRes.rows[0];

            // 4. Update Book with references
            const updateBookQuery = `
                UPDATE "Book" 
                SET default_currency_id = $1, root_account_id = $2
                WHERE id = $3
                RETURNING *
            `;
            const finalBookRes = await client.query(updateBookQuery, [baseCurrency.id, rootAccount.id, book.id]);

            // 5. Initialize BookSettings
            const settingsQuery = `
                INSERT INTO "BookSettings" (book_id, use_trading_accounts, use_split_action_field, auto_readonly_days, enable_euro_support, accounting_period)
                VALUES ($1, false, false, '0', false, '{}')
                RETURNING *
            `;
            await client.query(settingsQuery, [book.id]);

            await client.query('COMMIT');

            res.status(201).json({
                book: finalBookRes.rows[0],
                base_currency: baseCurrency,
                root_account: rootAccount
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    }

    static async getBooksByOrg(req, res) {
        try {
            const books = await BookModel.findByOrganizationId(req.params.orgId);
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBookSettings(req, res) {
        try {
            const settings = await BookSettingsModel.findByBookId(req.params.bookId);
            if (!settings) return res.status(404).json({ error: 'Settings not found' });
            res.json(settings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateBookSettings(req, res) {
        try {
            const settings = await BookSettingsModel.update(req.params.bookId, req.body);
            res.json(settings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BookController;
