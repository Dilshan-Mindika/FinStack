const express = require('express');
const UserPreferenceController = require('../controllers/userPreferenceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware.protect, UserPreferenceController.getPreferences);
router.put('/', authMiddleware.protect, UserPreferenceController.updatePreferences);

module.exports = router;
