const OrganizationModel = require('../models/organizationModel');
const UserRoleModel = require('../models/userRoleModel');

class OrganizationController {
    static async createOrganization(req, res) {
        try {
            const org = await OrganizationModel.create(req.body);
            res.status(201).json(org);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getOrganization(req, res) {
        try {
            const org = await OrganizationModel.findById(req.params.id);
            if (!org) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.json(org);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateOrganization(req, res) {
        try {
            const org = await OrganizationModel.update(req.params.id, req.body);
            if (!org) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.json(org);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteOrganization(req, res) {
        try {
            const org = await OrganizationModel.delete(req.params.id);
            if (!org) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.json({ message: 'Organization deactivated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OrganizationController;
