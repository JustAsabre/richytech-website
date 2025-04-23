document.addEventListener("DOMContentLoaded", function() {
    // Form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const container = document.querySelector('.container');
    
    // Message elements
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    
    // Toggle buttons (both desktop and mobile)
    const registerBtns = document.querySelectorAll('.register-btn');
    const loginBtns = document.querySelectorAll('.toggle-login-btn');
    
    // Profile elements
    const userDisplayName = document.getElementById('user-display-name');
    const logoutBtn = document.getElementById('log_out');

    // Get the base URL for API calls
    const getBaseUrl = () => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalhost 
            ? 'http://localhost:3000' 
            : 'https://richytech-website-1.onrender.com';
    };

    // Get the base URL for frontend redirects
    const getFrontendUrl = () => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalhost ? 'http://localhost:3000' : window.location.origin;
    };

    // Navigation function
    function navigateToHome() {
        window.location.href = `${getFrontendUrl()}/index.html`;
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        userDisplayName.textContent = username;
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear all auth-related data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            
            // Update display name to Guest
            if (userDisplayName) {
                userDisplayName.textContent = 'Guest';
            }
            
            // Redirect to homepage
            navigateToHome();
        });
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginButton = document.getElementById('login-btn');
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            // Disable button and show loading state
            loginButton.disabled = true;
            loginButton.classList.add('loading');
            loginButton.textContent = 'Logging in...';

            console.log('Attempting login with:', { username });
            const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok) {
                // Store user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userId', data.user.id);

                // Update UI
                showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                userDisplayName.textContent = data.user.username;

                // Redirect to homepage
                setTimeout(() => {
                    navigateToHome();
                }, 1500);
            } else {
                showMessage(loginMessage, data.message || 'Login failed', 'error');
                document.getElementById('loginPassword').value = '';
            }
        } catch (error) {
            console.error('Login error details:', error);
            showMessage(loginMessage, `Login failed: ${error.message}`, 'error');
        } finally {
            // Reset button state
            loginButton.disabled = false;
            loginButton.classList.remove('loading');
            loginButton.textContent = 'Login';
        }
    });

    // Add this function to check if the backend is available
    async function testBackendConnection() {
        try {
            const baseUrl = getBaseUrl();
            console.log('Testing connection to:', baseUrl);
            
            const response = await fetch(`${baseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            
            if (!response.ok) {
                console.error('Health check failed:', response.status, response.statusText);
                const text = await response.text();
                console.error('Response:', text);
                return false;
            }
            
            const data = await response.json();
            console.log('Backend health check:', data);
            return true;
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return false;
        }
    }

    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const registerButton = registerForm.querySelector('button[type="submit"]');
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        try {
            // Disable button and show loading state
            registerButton.disabled = true;
            registerButton.classList.add('loading');
            registerButton.textContent = 'Registering...';

            // Test backend connection first
            const isBackendAvailable = await testBackendConnection();
            if (!isBackendAvailable) {
                throw new Error('Cannot connect to the server. Please try again later.');
            }

            console.log('Attempting registration with:', { username, email });
            const baseUrl = getBaseUrl();
            console.log('Using backend URL:', baseUrl);
            
            const response = await fetch(`${baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
                mode: 'cors'
            });

            console.log('Registration response status:', response.status);
            const data = await response.json();
            console.log('Registration response data:', data);

            if (response.ok) {
                showMessage(registerMessage, 'Registration successful! Please login.', 'success');
                registerForm.reset();
                setTimeout(() => {
                    container.classList.remove('active');
                }, 1500);
            } else {
                showMessage(registerMessage, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error details:', error);
            showMessage(registerMessage, `Registration failed: ${error.message}`, 'error');
        } finally {
            // Reset button state
            registerButton.disabled = false;
            registerButton.classList.remove('loading');
            registerButton.textContent = 'Register';
        }
    });

    // Add click handlers for all register buttons
    registerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            container.classList.add('active');
            clearMessages();
        });
    });

    // Add click handlers for all login buttons
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            container.classList.remove('active');
            clearMessages();
        });
    });

    // Utility functions
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message-box ' + type;
        setTimeout(() => {
            element.className = 'message-box';
        }, 5000);
    }

    function clearMessages() {
        loginMessage.className = 'message-box';
        registerMessage.className = 'message-box';
    }

    // Sidebar functionality
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
    let searchBtn = document.querySelector(".bx-search");

    closeBtn?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
        menuBtnChange();
    });

    searchBtn?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
        menuBtnChange();
    });

    function menuBtnChange() {
        if (!sidebar || !closeBtn) return;
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    menuBtnChange();
});