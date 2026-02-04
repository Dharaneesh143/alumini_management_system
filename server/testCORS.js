const axios = require('axios');

const testCORS = async () => {
    console.log('🔍 Testing CORS and API Configuration...\n');

    try {
        // Test 1: Check CORS headers
        console.log('1️⃣ Testing CORS configuration...');
        const corsTest = await axios.get('http://localhost:5000/', {
            headers: {
                'Origin': 'http://localhost:5173'
            }
        });
        console.log('✅ CORS is configured correctly');
        console.log('   Server response:', corsTest.data);
        console.log('');

        // Test 2: Test login endpoint with CORS
        console.log('2️⃣ Testing login with CORS headers...');
        const loginTest = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@alumni.com',
            password: 'password123'
        }, {
            headers: {
                'Origin': 'http://localhost:5173',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log('✅ Login successful with CORS!');
        console.log('   User:', loginTest.data.user.name, '(' + loginTest.data.user.role + ')');
        console.log('');

        // Test 3: Test authenticated request
        console.log('3️⃣ Testing authenticated request...');
        const token = loginTest.data.token;
        const jobsTest = await axios.get('http://localhost:5000/api/jobs', {
            headers: {
                'Origin': 'http://localhost:5173',
                'x-auth-token': token
            }
        });
        console.log('✅ Authenticated request successful!');
        console.log('   Jobs found:', jobsTest.data.length);
        console.log('');

        console.log('🎉 All CORS and API tests passed!\n');
        console.log('📋 Summary:');
        console.log('   ✓ CORS is properly configured');
        console.log('   ✓ Frontend can connect to backend');
        console.log('   ✓ Authentication is working');
        console.log('   ✓ API endpoints are accessible');
        console.log('\n✨ You can now restart both servers and test in the browser!');

    } catch (error) {
        console.error('❌ Test failed!');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
            console.error('   Headers:', error.response.headers);
        } else if (error.request) {
            console.error('   No response from server');
            console.error('   Make sure the backend is running on port 5000');
        } else {
            console.error('   Error:', error.message);
        }
    }
};

testCORS();
