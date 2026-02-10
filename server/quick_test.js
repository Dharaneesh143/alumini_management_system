const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Testing admin login after server restart...\n');

        const res = await axios.post('http://localhost:5000/api/auth/admin-login', {
            email: 'dharaneesh@admin.com',
            password: 'Dharaneesh@1'
        });

        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('Token:', res.data.token.substring(0, 40) + '...');
        console.log('User:', JSON.stringify(res.data.user, null, 2));

    } catch (err) {
        console.log('❌ LOGIN FAILED');
        console.log('Status:', err.response?.status);
        console.log('Error:', err.response?.data);
    }
};

testLogin();
