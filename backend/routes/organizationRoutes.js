const express = require('express');
const OrganizationController = require('../controllers/organizationController');

const router = express.Router();

router.post('/', OrganizationController.createOrganization);
router.get('/:id', OrganizationController.getOrganization);
router.get('/:id/users', OrganizationController.getOrganizationUsers);
router.put('/:id', OrganizationController.updateOrganization);
router.delete('/:id', OrganizationController.deleteOrganization);

module.exports = router;
