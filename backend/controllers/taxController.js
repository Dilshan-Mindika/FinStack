const { TaxTableModel, TaxTableEntryModel } = require('../models/taxModel');
const db = require('../db');

class TaxController {
    static async getTaxTables(req, res) {
        try {
            const taxes = await TaxTableModel.findByBookId(req.params.bookId);
            // Fetch entries for each tax table? Or just return list and fetch details on demand?
            // For a list view, typically we want the name and total rate.
            // Let's attach entries for now, users won't have 1000s of tax rates.

            const results = await Promise.all(taxes.map(async (tax) => {
                const entries = await TaxTableEntryModel.findByTaxTableId(tax.id);
                return { ...tax, entries };
            }));

            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createTaxTable(req, res) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const { book_id, name, entries } = req.body; // entries array of { account_id, amount_num, ... }

            // 1. Create Header
            const taxTable = await TaxTableModel.create({ book_id, name });

            // 2. Create Entries
            if (entries && entries.length > 0) {
                for (const entry of entries) {
                    await TaxTableEntryModel.create({
                        tax_table_id: taxTable.id,
                        account_id: entry.account_id,
                        amount_num: entry.amount_num,
                        amount_denom: entry.amount_denom,
                        type: entry.type
                    });
                }
            }

            await client.query('COMMIT');

            // Return full object
            const createdEntries = await TaxTableEntryModel.findByTaxTableId(taxTable.id);
            res.status(201).json({ ...taxTable, entries: createdEntries });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: error.message });
        } finally {
            client.release();
        }
    }
}

module.exports = TaxController;
