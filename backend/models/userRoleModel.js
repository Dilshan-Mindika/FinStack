const db = require('../db');

class UserRoleModel {
    static async create({ user_id, organization_id, role, permissions }) {
        const query = `
      INSERT INTO "UserRole" (user_id, organization_id, role, permissions)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const values = [user_id, organization_id, role, permissions];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByUserId(user_id) {
        const query = `
      SELECT ur.*, o.name as organization_name 
      FROM "UserRole" ur
      JOIN "Organization" o ON ur.organization_id = o.id
      WHERE ur.user_id = $1
    `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    static async update(id, { role, permissions }) {
        const query = `
      UPDATE "UserRole"
      SET role = COALESCE($2, role),
          permissions = COALESCE($3, permissions)
      WHERE id = $1
      RETURNING *;
    `;
        const values = [id, role, permissions];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM "UserRole" WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = UserRoleModel;
