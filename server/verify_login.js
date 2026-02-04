const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Testing Admin Login...');
        const res = await axios.post('http://localhost:5000/api/auth/admin-login', {
            email: 'admin@alumni.com',
            password: 'admin123'
        });
        console.log('LOGIN SUCCESS!');
        console.log('Token:', res.data.token ? 'Received' : 'Missing');
        console.log('User Role:', res.data.user.role);
    } catch (err) {
        console.error('LOGIN FAILED');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
};

testLogin();
