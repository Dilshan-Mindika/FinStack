const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const OrganizationModel = require('../models/organizationModel');
const UserRoleModel = require('../models/userRoleModel');
const UserRoleModel = require('../models/userRoleModel');
const UserSessionModel = require('../models/userSessionModel');
const UserPreferenceModel = require('../models/userPreferenceModel');
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

            // 2. Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Create User
            const userData = {
                email,
                password_hash: hashedPassword,
                first_name,
                last_name,
                phone
            };

            const user = await UserModel.create(userData);

            // 4. Create Organization
            const orgData = {
                name: org_name,
                tax_id: org_tax_id,
                address: org_address,
                email: email,
                phone: phone
            };

            const organization = await OrganizationModel.create(orgData);

            // 5. Assign 'admin' Role
            await UserRoleModel.create({
                user_id: user.id,
                organization_id: organization.id,
                role: 'admin',
                permissions: { all: true }
            });

            // 6. Generate Token
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

    // desc    Auth user & get token
    // route   POST /api/auth/login
    // access  Public
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Find user
            const user = await UserModel.findByEmail(email);

            // 2. Check password
            if (user && (await bcrypt.compare(password, user.password_hash))) {

                // 3. Generate Token
                const token = generateToken(user.id);

                // 4. Create DB Session
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                await UserSessionModel.create({
                    user_id: user.id,
                    token: token,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    expires_at: expiresAt
                });

                // 5. Get User Role for response
                const roles = await UserRoleModel.findByUserId(user.id);
                const role = roles.length > 0 ? roles[0].role : 'viewer';

                // 6. Get Organization for response
                let organization = null;
                if (roles.length > 0) {
                    organization = await OrganizationModel.findById(roles[0].organization_id);
                }

                // 7. Get Preferences
                const preferences = await UserPreferenceModel.findByUserId(user.id);

                res.json({
                    user: {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: role,
                        preferences: preferences || {}
                    },
                    organization: organization,
                    token
                });

            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    // desc    Get current logged in user
    // route   GET /api/auth/me
    // access  Private
    static async getMe(req, res) {
        try {
            // req.user is set by authMiddleware
            const user = await UserModel.findById(req.user.id);
            const roles = await UserRoleModel.findByUserId(user.id);

            const role = roles.length > 0 ? roles[0].role : 'viewer';
            let organization = null;

            if (roles.length > 0) {
                organization = await OrganizationModel.findById(roles[0].organization_id);
            }

            // Get Preferences
            const preferences = await UserPreferenceModel.findByUserId(user.id);

            res.json({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role,
                organization,
                preferences: preferences || {}
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;
