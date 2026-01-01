const db = require('../db');

class UserSessionModel {
    static async create({ user_id, token, ip_address, user_agent, expires_at }) {
        const query = `
      INSERT INTO "UserSession" (user_id, token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const values = [user_id, token, ip_address, user_agent, expires_at];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByToken(token) {
        const query = `SELECT * FROM "UserSession" WHERE token = $1 AND is_active = TRUE`;
        const result = await db.query(query, [token]);
        return result.rows[0];
    }

    static async deactivate(token) {
        const query = `
      UPDATE "UserSession"
      SET is_active = FALSE
      WHERE token = $1
      RETURNING *;
    `;
        const result = await db.query(query, [token]);
        return result.rows[0];
    }
}

module.exports = UserSessionModel;
