const db = require('../db');

class BookModel {
    static async create({ organization_id, name, description, fiscal_year_start }) {
        const query = `
      INSERT INTO "Book" (organization_id, name, description, fiscal_year_start)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const values = [organization_id, name, description, fiscal_year_start];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async update(id, updates) {
        // Dynamic update
        const setClause = Object.keys(updates).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];

        const query = `
            UPDATE "Book" 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByOrganizationId(organization_id) {
        const query = `SELECT * FROM "Book" WHERE organization_id = $1`;
        const result = await db.query(query, [organization_id]);
        return result.rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM "Book" WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = BookModel;
