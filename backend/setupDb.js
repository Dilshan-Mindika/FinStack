const fs = require('fs');
const path = require('path');
const db = require('./db');

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function setupDatabase() {
    console.log('Starting database setup...');
    try {
        await db.query(schemaSql);
        console.log('Database schema created successfully!');
    } catch (err) {
        console.error('Error creating database schema:', err);
    } finally {
        await db.pool.end();
    }
}

setupDatabase();
