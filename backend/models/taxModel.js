const db = require('../db');

class TaxTableModel {
    static async create({ book_id, name, is_default = false }) {
        const query = `
            INSERT INTO "TaxTable" (book_id, name, is_default)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [book_id, name, is_default]);
        return result.rows[0];
    }

    static async findByBookId(book_id) {
        const query = `SELECT * FROM "TaxTable" WHERE book_id = $1 AND active = TRUE ORDER BY name`;
        const result = await db.query(query, [book_id]);
        return result.rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM "TaxTable" WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

class TaxTableEntryModel {
    static async create({ tax_table_id, account_id, amount_num, amount_denom = 100, type = 'PERCENT', sort_order = 0 }) {
        const query = `
            INSERT INTO "TaxTableEntry" (tax_table_id, account_id, amount_num, amount_denom, type, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await db.query(query, [tax_table_id, account_id, amount_num, amount_denom, type, sort_order]);
        return result.rows[0];
    }

    static async findByTaxTableId(tax_table_id) {
        const query = `
            SELECT tte.*, a.name as account_name 
            FROM "TaxTableEntry" tte
            JOIN "Account" a ON tte.account_id = a.id
            WHERE tax_table_id = $1
            ORDER BY sort_order ASC
        `;
        const result = await db.query(query, [tax_table_id]);
        return result.rows;
    }

    static async deleteByTaxTableId(tax_table_id) {
        const query = `DELETE FROM "TaxTableEntry" WHERE tax_table_id = $1`;
        await db.query(query, [tax_table_id]);
    }
}

module.exports = { TaxTableModel, TaxTableEntryModel };
