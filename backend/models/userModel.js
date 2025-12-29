const db = require('../db');

class UserModel {
    static async create({ email, password_hash, first_name, last_name, phone }) {
        const query = `
      INSERT INTO "User" (email, password_hash, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, phone, created_at;
    `;
        const values = [email, password_hash, first_name, last_name, phone];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `SELECT * FROM "User" WHERE email = $1`;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `SELECT id, email, first_name, last_name, phone, created_at, is_active FROM "User" WHERE id = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, { first_name, last_name, phone }) {
        const query = `
      UPDATE "User"
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          phone = COALESCE($4, phone),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, phone, updated_at;
    `;
        const values = [id, first_name, last_name, phone];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        // Soft delete usually, but for "delete" step we might implementing hard delete or soft delete.
        // ERD has is_active, so let's do soft delete as best practice, but sticking to "delete" naming.
        // The prompt asked for "delete", let's implement a hard delete method just in case, or toggle active.
        // I will implement a hard delete for now as specific CRUD, and maybe a soft delete method too.

        // Actually, let's use the is_active flag as per the schema for "deactivating".
        const query = `
      UPDATE "User"
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, is_active;
    `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = UserModel;
