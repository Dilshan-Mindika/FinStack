const db = require('../db');

class UserPreferenceModel {
    static async createOrUpdate(userId, preferences) {
        // Check if preferences exist for user
        const existing = await this.findByUserId(userId);

        if (existing) {
            // Update
            const { locale, timezone, date_format, number_format, currency, ui_settings, notification_settings } = preferences;

            // Construct dynamic update query
            const updates = [];
            const values = [userId];
            let idx = 2;

            if (locale !== undefined) { updates.push(`locale = $${idx++}`); values.push(locale); }
            if (timezone !== undefined) { updates.push(`timezone = $${idx++}`); values.push(timezone); }
            if (date_format !== undefined) { updates.push(`date_format = $${idx++}`); values.push(date_format); }
            if (number_format !== undefined) { updates.push(`number_format = $${idx++}`); values.push(number_format); }
            if (currency !== undefined) { updates.push(`currency = $${idx++}`); values.push(currency); }
            if (ui_settings !== undefined) { updates.push(`ui_settings = $${idx++}`); values.push(ui_settings); }
            if (notification_settings !== undefined) { updates.push(`notification_settings = $${idx++}`); values.push(notification_settings); }

            if (updates.length === 0) return existing;

            const query = `
                UPDATE "UserPreference"
                SET ${updates.join(', ')}
                WHERE user_id = $1
                RETURNING *;
            `;
            const result = await db.query(query, values);
            return result.rows[0];

        } else {
            // Create
            const { locale, timezone, date_format, number_format, currency, ui_settings, notification_settings } = preferences;
            const query = `
                INSERT INTO "UserPreference" (user_id, locale, timezone, date_format, number_format, currency, ui_settings, notification_settings)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const values = [
                userId,
                locale || 'en-US',
                timezone || 'UTC',
                date_format || 'YYYY-MM-DD',
                number_format || '1,234.56',
                currency || 'USD',
                ui_settings || {},
                notification_settings || {}
            ];
            const result = await db.query(query, values);
            return result.rows[0];
        }
    }

    static async findByUserId(userId) {
        const query = `SELECT * FROM "UserPreference" WHERE user_id = $1`;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = UserPreferenceModel;
