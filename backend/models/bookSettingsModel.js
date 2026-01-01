const db = require('../db');

class BookSettingsModel {
    static async create({ book_id }) {
        const query = `
            INSERT INTO "BookSettings" (book_id, use_trading_accounts, use_split_action_field, auto_readonly_days, enable_euro_support, accounting_period)
            VALUES ($1, false, false, '0', false, '{}')
            RETURNING *;
        `;
        const result = await db.query(query, [book_id]);
        return result.rows[0];
    }

    static async findByBookId(book_id) {
        const query = `SELECT * FROM "BookSettings" WHERE book_id = $1`;
        const result = await db.query(query, [book_id]);
        return result.rows[0];
    }

    static async update(book_id, updates) {
        const allowedColumns = ['use_trading_accounts', 'use_split_action_field', 'auto_readonly_days', 'enable_euro_support', 'accounting_period'];
        const keys = Object.keys(updates).filter(k => allowedColumns.includes(k));

        if (keys.length === 0) return null;

        const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const values = [book_id, ...keys.map(k => updates[k])];

        const query = `
            UPDATE "BookSettings"
            SET ${setClause}
            WHERE book_id = $1
            RETURNING *;
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = BookSettingsModel;
