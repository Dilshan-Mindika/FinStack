const fetch = require('node:fetch'); // Or just global fetch in Node 18+

// Config
const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    console.log("Starting Verification Test...");
    const timestamp = Date.now();
    const testUser = {
        email: `test_${timestamp}@example.com`,
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
        phone: '1234567890',
        org_name: `Test Org ${timestamp}`,
        org_address: '123 Street',
        org_tax_id: 'TAX-123'
    };

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${testUser.email}`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            throw new Error(`Register failed: ${regRes.status} ${err}`);
        }
        const regData = await regRes.json();
        console.log('✅ Register Success!');
        console.log('   User ID:', regData.user.id);
        console.log('   Org ID:', regData.organization.id);
        console.log('   Token:', regData.token ? 'Received' : 'Missing');

        // 2. Login
        console.log(`\n2. Logging in...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        console.log('✅ Login Success!');
        const token = loginData.token;

        // 3. Get Profile (Protected)
        console.log(`\n3. Fetching /auth/me (Protected Route)...`);
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!meRes.ok) throw new Error(`Get Me failed: ${meRes.status}`);
        const meData = await meRes.json();
        console.log('✅ Get Me Success! Hello, ' + meData.user.first_name);

        // 4. Get Organization Users (Protected + New Feature)
        console.log(`\n4. Fetching Organization Users (New Feature)...`);
        const usersRes = await fetch(`${BASE_URL}/organizations/${regData.organization.id}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!usersRes.ok) throw new Error(`Get Org Users failed: ${usersRes.status}`);
        const usersData = await usersRes.json();
        console.log(`✅ Get Org Users Success! Found ${usersData.length} users.`);
        console.log('   User list:', usersData.map(u => u.email).join(', '));

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        process.exit(1);
    }
}

// Check if fetch is available (Node 18+)
if (!globalThis.fetch) {
    console.error("This script requires Node.js 18+ or a fetch polyfill.");
} else {
    runTest();
}
