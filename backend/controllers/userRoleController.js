const UserRoleModel = require('../models/userRoleModel');

class UserRoleController {
    static async assignRole(req, res) {
        try {
            const { user_id, organization_id, role, permissions } = req.body;
            const validRoles = ['admin', 'manager', 'accountant', 'viewer'];

            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            const userRole = await UserRoleModel.create({ user_id, organization_id, role, permissions });
            res.status(201).json(userRole);
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation if exists
                return res.status(409).json({ error: 'User already has a role in this organization' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserRoles(req, res) {
        try {
            const roles = await UserRoleModel.findByUserId(req.params.userId);
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateRole(req, res) {
        try {
            const userRole = await UserRoleModel.update(req.params.id, req.body);
            if (!userRole) {
                return res.status(404).json({ error: 'Role assignment not found' });
            }
            res.json(userRole);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async removeRole(req, res) {
        try {
            const userRole = await UserRoleModel.delete(req.params.id);
            if (!userRole) {
                return res.status(404).json({ error: 'Role assignment not found' });
            }
            res.json({ message: 'Role removed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserRoleController;
