const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoleRoutes = require('./routes/userRoleRoutes');
const authRoutes = require('./routes/authRoutes');
const commodityRoutes = require('./routes/commodityRoutes');
const bookRoutes = require('./routes/bookRoutes');
const taxRoutes = require('./routes/taxRoutes');
const accountRoutes = require('./routes/accountRoutes');
const userPreferenceRoutes = require('./routes/userPreferenceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/preferences', userPreferenceRoutes);





// Basic health check route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Test DB connection
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'success', timestamp: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test DB connection at http://localhost:${PORT}/api/health`);
});
