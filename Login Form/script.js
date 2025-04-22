document.addEventListener("DOMContentLoaded", function() {
    // Form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const container = document.querySelector('.container');
    
    // Message elements
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    
    // Toggle buttons
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.toggle-panel .login-btn');
    
    // Profile elements
    const userDisplayName = document.getElementById('user-display-name');
    const logoutBtn = document.getElementById('log_out');

    // Get the base URL for API calls
    const getBaseUrl = () => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalhost ? 'http://localhost:5000' : 'https://your-backend-url.onrender.com'; // Replace with your actual Render URL
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
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

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
            showMessage(loginMessage, 'An error occurred during login', 'error');
            console.error('Login error:', error);
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();

        try {
            const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(registerMessage, 'Registration successful! Please login.', 'success');
                // Clear form and switch to login
                registerForm.reset();
                setTimeout(() => {
                    container.classList.remove('active');
                }, 1500);
            } else {
                showMessage(registerMessage, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage(registerMessage, 'An error occurred during registration', 'error');
            console.error('Registration error:', error);
        }
    });

    // Form toggle functionality
    if (container && registerBtn && loginBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add('active');
            clearMessages();
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove('active');
            clearMessages();
        });
    }

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