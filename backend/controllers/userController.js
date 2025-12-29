const UserModel = require('../models/userModel');

class UserController {
    static async createUser(req, res) {
        try {
            // Note: validation and password hashing should be here or middleware. 
            // Proceeding with raw data for this step as per plan order (hashing is Step 8).
            const user = await UserModel.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation (email)
                return res.status(409).json({ error: 'Email already exists' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    static async getUser(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateUser(req, res) {
        try {
            const user = await UserModel.update(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            const user = await UserModel.delete(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User deactivated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
