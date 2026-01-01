const BookModel = require('../models/bookModel');
const CommodityModel = require('../models/commodityModel');
const AccountModel = require('../models/accountModel');
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
}

module.exports = BookController;
