const express = require('express');
const UserRoleController = require('../controllers/userRoleController');

const router = express.Router();

router.post('/', UserRoleController.assignRole);
router.get('/user/:userId', UserRoleController.getUserRoles);
router.put('/:id', UserRoleController.updateRole);
router.delete('/:id', UserRoleController.removeRole);

module.exports = router;
