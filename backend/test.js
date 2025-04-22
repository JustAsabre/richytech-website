const fetch = require('node-fetch');

async function testRegistration() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        console.log('Registration test:', data);
        return data;
    } catch (error) {
        console.error('Registration test failed:', error);
    }
}

async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        console.log('Login test:', data);
        return data;
    } catch (error) {
        console.error('Login test failed:', error);
    }
}

async function runTests() {
    console.log('Running API tests...');
    await testRegistration();
    await testLogin();
}

runTests(); 