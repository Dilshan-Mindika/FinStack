const db = require('../db');

class AccountModel {
    static async create({ book_id, parent_id, name, type, commodity_id, code, description, placeholder = false }) {
        const query = `
            INSERT INTO "Account" (book_id, parent_id, name, type, commodity_id, code, description, placeholder)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [book_id, parent_id, name, type, commodity_id, code, description, placeholder];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByBookId(book_id) {
        const query = `SELECT * FROM "Account" WHERE book_id = $1 ORDER BY code ASC, name ASC`;
        const result = await db.query(query, [book_id]);
        return result.rows;
    }
}

module.exports = AccountModel;
