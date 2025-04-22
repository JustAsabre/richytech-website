document.addEventListener("DOMContentLoaded", function() {
    console.log("Settings script loaded");

    // --- Element References ---
    const themeSwitch = document.getElementById('theme-switch');
    const loginStatus = document.getElementById('login-status');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    
    // Password change elements
    const changePasswordBtn = document.getElementById('change-password');
    const passwordChangeForm = document.getElementById('password-change-form');
    const savePasswordBtn = document.getElementById('save-password');
    const cancelPasswordChangeBtn = document.getElementById('cancel-password-change');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    // Account deletion elements
    const deleteAccountBtn = document.getElementById('delete-account');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const confirmDeleteBtn = document.getElementById('confirm-delete-account');
    const cancelDeleteBtn = document.getElementById('cancel-delete-account');
    const deleteConfirmPassword = document.getElementById('delete-confirm-password');
    const deleteConfirmCheckbox = document.getElementById('delete-confirm-checkbox');
    
    const clearDataBtn = document.getElementById('clear-data');

    // --- Load User Profile Info ---
    function loadUserProfile() {
        console.log("Loading user profile...");
        // Check both localStorage and sessionStorage
        const username = localStorage.getItem('username') || sessionStorage.getItem('username');
        const email = localStorage.getItem('email') || sessionStorage.getItem('email');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        console.log("User data:", {
            username: username,
            email: email,
            hasToken: !!token
        });
        
        if (loginStatus) {
            loginStatus.classList.remove('logged-in', 'logged-out'); // Reset classes
            if (username && token) {
                loginStatus.textContent = 'Logged In';
                loginStatus.classList.add('logged-in');
                console.log("User is logged in as:", username);
            } else {
                loginStatus.textContent = 'Not Logged In';
                loginStatus.classList.add('logged-out');
                console.log("User is not logged in");
            }
        }
        
        if (profileUsername) {
            profileUsername.textContent = username || 'Not Logged In';
        }
        
        if (profileEmail) {
            profileEmail.textContent = email || 'No email available';
        }

        // Update button states based on login status
        const isLoggedIn = !!(username && token);
        if (changePasswordBtn) changePasswordBtn.disabled = !isLoggedIn;
        if (deleteAccountBtn) deleteAccountBtn.disabled = !isLoggedIn;

        // Update the profile section in the sidebar
        const sidebarName = document.querySelector('.profile .name');
        if (sidebarName && username) {
            sidebarName.textContent = username;
        }

        // Update the profile job title if logged in
        const jobTitle = document.querySelector('.profile .job');
        if (jobTitle) {
            jobTitle.textContent = isLoggedIn ? 'Member' : 'Guest';
        }
    }

    // --- Password Change Functionality ---
    function togglePasswordForm(show) {
        if (passwordChangeForm) {
            if (show) {
                passwordChangeForm.style.display = 'block';
                passwordChangeForm.classList.add('visible');
                changePasswordBtn.style.display = 'none';
            } else {
                passwordChangeForm.style.display = 'none';
                passwordChangeForm.classList.remove('visible');
                changePasswordBtn.style.display = 'block';
                // Clear form
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            }
        }
    }

    function handlePasswordChange() {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            alert("New password must be at least 8 characters long.");
            return;
        }

        // Here you would typically make an API call to change the password
        // For now, we'll simulate success
        alert("Password changed successfully!");
        togglePasswordForm(false);
    }

    // --- Account Deletion Functionality ---
    function toggleDeleteForm(show) {
        if (deleteAccountForm) {
            if (show) {
                deleteAccountForm.style.display = 'block';
                deleteAccountForm.classList.add('visible');
                deleteAccountBtn.style.display = 'none';
            } else {
                deleteAccountForm.style.display = 'none';
                deleteAccountForm.classList.remove('visible');
                deleteAccountBtn.style.display = 'block';
                // Clear form
                deleteConfirmPassword.value = '';
                deleteConfirmCheckbox.checked = false;
            }
        }
    }

    function handleAccountDeletion() {
        if (!deleteConfirmCheckbox.checked) {
            alert("Please confirm that you understand this action cannot be undone.");
            return;
        }

        if (!deleteConfirmPassword.value) {
            alert("Please enter your password to confirm deletion.");
            return;
        }

        // Here you would typically make an API call to delete the account
        // For now, we'll clear all data and redirect
        sessionStorage.clear();
        localStorage.clear();

        // Update UI elements that rely on storage
        if (typeof window.updateCartIcon === 'function') window.updateCartIcon();
        if (typeof window.updateWishlistIcon === 'function') window.updateWishlistIcon();

        alert("Account deleted successfully. You will be redirected to the login page.");
        window.location.href = "../Login Form/user.html";
    }

    // --- Event Listeners ---
    
    // Theme Switch
    if (themeSwitch) {
        themeSwitch.checked = (localStorage.getItem('theme') === 'dark');
        themeSwitch.addEventListener('change', () => {
            const newTheme = themeSwitch.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Password Change Events
    changePasswordBtn?.addEventListener('click', () => togglePasswordForm(true));
    cancelPasswordChangeBtn?.addEventListener('click', () => togglePasswordForm(false));
    savePasswordBtn?.addEventListener('click', handlePasswordChange);

    // Account Deletion Events
    deleteAccountBtn?.addEventListener('click', () => toggleDeleteForm(true));
    cancelDeleteBtn?.addEventListener('click', () => toggleDeleteForm(false));
    confirmDeleteBtn?.addEventListener('click', handleAccountDeletion);

    // Clear Session Data
    clearDataBtn?.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your current Cart and Wishlist? This will not log you out.")) {
            sessionStorage.removeItem('cart');
            sessionStorage.removeItem('cartItemCount');
            sessionStorage.removeItem('wishlist');
            alert("Cart and Wishlist data cleared.");

            if (typeof window.updateCartIcon === 'function') window.updateCartIcon();
            if (typeof window.updateWishlistIcon === 'function') window.updateWishlistIcon();
        }
    });

    // --- Theme Functions ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Add logout handler
    const logoutBtn = document.getElementById('log_out');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log("Logging out...");
            // Clear both storage types
            sessionStorage.clear();
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            localStorage.removeItem('userId');
            
            // Redirect to login page
            window.location.href = "../Login Form/user.html";
        });
    }

    // --- Initial Setup ---
    loadUserProfile();
    applyTheme(localStorage.getItem('theme') || 'light');

    // Add periodic check for session updates
    setInterval(loadUserProfile, 2000); // Check every 2 seconds
});