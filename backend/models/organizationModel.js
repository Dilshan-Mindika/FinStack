const db = require('../db');

class OrganizationModel {
    static async create({ name, tax_id, address, city, state, country, postal_code, phone, email }) {
        const query = `
      INSERT INTO "Organization" (name, tax_id, address, city, state, country, postal_code, phone, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
        const values = [name, tax_id, address, city, state, country, postal_code, phone, email];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `SELECT * FROM "Organization" WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, data) {
        // Dynamic update query construction could be useful here, but for now explicitly listing fields
        const query = `
      UPDATE "Organization"
      SET name = COALESCE($2, name),
          tax_id = COALESCE($3, tax_id),
          address = COALESCE($4, address),
          city = COALESCE($5, city),
          state = COALESCE($6, state),
          country = COALESCE($7, country),
          postal_code = COALESCE($8, postal_code),
          phone = COALESCE($9, phone),
          email = COALESCE($10, email),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
        const values = [
            id,
            data.name,
            data.tax_id,
            data.address,
            data.city,
            data.state,
            data.country,
            data.postal_code,
            data.phone,
            data.email
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        // Soft delete
        const query = `
      UPDATE "Organization"
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, is_active;
    `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = OrganizationModel;
