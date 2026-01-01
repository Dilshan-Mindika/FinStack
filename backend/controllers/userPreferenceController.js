const UserPreferenceModel = require('../models/userPreferenceModel');

class UserPreferenceController {
    static async getPreferences(req, res) {
        try {
            let prefs = await UserPreferenceModel.findByUserId(req.user.id);
            if (!prefs) {
                // Return defaults if not found, don't error
                prefs = {
                    locale: 'en-US',
                    timezone: 'UTC',
                    date_format: 'YYYY-MM-DD',
                    number_format: '1,234.56',
                    currency: 'USD',
                    ui_settings: {},
                    notification_settings: {}
                };
            }
            res.json(prefs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updatePreferences(req, res) {
        try {
            const prefs = await UserPreferenceModel.createOrUpdate(req.user.id, req.body);
            res.json(prefs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserPreferenceController;
