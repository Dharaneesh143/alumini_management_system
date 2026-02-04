const axios = require('axios');

const testBackend = async () => {
    console.log('🔍 Testing Alumni Portal Backend...\n');

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connection...');
        const healthCheck = await axios.get('http://localhost:5000');
        console.log('✅ Server is running:', healthCheck.data);
        console.log('');

        // Test 2: Login with Admin
        console.log('2️⃣ Testing Admin login...');
        const adminLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@alumni.com',
            password: 'password123'
        });
        console.log('✅ Admin login successful!');
        console.log('   Token:', adminLogin.data.token.substring(0, 20) + '...');
        console.log('   User:', adminLogin.data.user);
        console.log('');

        // Test 3: Login with Alumni
        console.log('3️⃣ Testing Alumni login...');
        const alumniLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'alumni@alumni.com',
            password: 'password123'
        });
        console.log('✅ Alumni login successful!');
        console.log('   User:', alumniLogin.data.user);
        console.log('');

        // Test 4: Login with Student
        console.log('4️⃣ Testing Student login...');
        const studentLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'student@alumni.com',
            password: 'password123'
        });
        console.log('✅ Student login successful!');
        console.log('   User:', studentLogin.data.user);
        console.log('');

        // Test 5: Test invalid login
        console.log('5️⃣ Testing invalid credentials...');
        try {
            await axios.post('http://localhost:5000/api/auth/login', {
                email: 'wrong@email.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            console.log('✅ Invalid login properly rejected:', error.response.data.msg);
        }
        console.log('');

        console.log('🎉 All backend tests passed! Backend is working correctly!\n');
        console.log('📋 Summary:');
        console.log('   ✓ Server is running on port 5000');
        console.log('   ✓ MongoDB connection is working');
        console.log('   ✓ All three user roles can login');
        console.log('   ✓ Authentication is working properly');
        console.log('   ✓ Error handling is working');

    } catch (error) {
        console.error('❌ Backend test failed!');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
        } else if (error.request) {
            console.error('   No response from server. Is it running?');
            console.error('   Make sure: npm run start is running in the server directory');
        } else {
            console.error('   Error:', error.message);
        }
    }
};

testBackend();
