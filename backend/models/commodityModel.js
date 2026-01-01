const db = require('../db');

class CommodityModel {
    static async create({ book_id, namespace, mnemonic, fullname, fraction = 100, quote_source = 'CURRENCY', get_quotes = false }) {
        const query = `
      INSERT INTO "Commodity" (book_id, namespace, mnemonic, fullname, fraction, quote_source, get_quotes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [book_id, namespace, mnemonic, fullname, fraction, quote_source, get_quotes];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `SELECT * FROM "Commodity" WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByBookId(book_id) {
        const query = `SELECT * FROM "Commodity" WHERE book_id = $1`;
        const result = await db.query(query, [book_id]);
        return result.rows;
    }

    // Standard list of currencies (can be seeded or fetched hardcoded if no book_id needed for standard)
    // Actually, commodities are usually tied to a book or are global. 
    // In our schema, Commodity has book_id. 
    // We might want a way to "clone" standard currencies into a book.
}

module.exports = CommodityModel;
