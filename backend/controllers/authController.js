const UserModel = require('../models/userModel');
const OrganizationModel = require('../models/organizationModel');
const UserRoleModel = require('../models/userRoleModel');
const { generateToken } = require('../utils/jwtUtils');

class AuthController {
    // desc    Register a new user and organization
    // route   POST /api/auth/register
    // access  Public
    static async register(req, res) {
        try {
            const {
                email,
                password,
                first_name,
                last_name,
                phone,
                org_name,
                org_address,
                org_tax_id
            } = req.body;

            // 1. Check if user already exists
            const userExists = await UserModel.findByEmail(email);
            if (userExists) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // 2. Create User
            // Note: Password hashing will be implemented in Step 8. Storing plain text for now.
            const userData = {
                email,
                password_hash: password,
                first_name,
                last_name,
                phone
            };

            const user = await UserModel.create(userData);

            // 3. Create Organization
            const orgData = {
                name: org_name,
                tax_id: org_tax_id,
                address: org_address,
                email: email, // Default org email to user email
                phone: phone  // Default org phone to user phone
            };

            const organization = await OrganizationModel.create(orgData);

            // 4. Assign 'admin' Role
            await UserRoleModel.create({
                user_id: user.id,
                organization_id: organization.id,
                role: 'admin',
                permissions: { all: true }
            });

            // 5. Generate Token
            const token = generateToken(user.id);

            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: 'admin'
                },
                organization: organization,
                token
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;
