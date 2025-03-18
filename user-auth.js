// User authentication and profile management

// Global variables
let currentUser = null;

// Initialize user authentication tables
function initializeUserAuth() {
    if (!db) {
        console.error('Database not initialized');
        return;
    }
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE
        );
    `);
}

// User registration
function registerUser(username, password, email) {
    try {
        // TODO: Add password hashing in future implementation
        const stmt = db.prepare(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`);
        const result = stmt.run(username, password, email);
        return { success: true, userId: result.lastInsertRowid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// User login
function loginUser(username, password) {
    try {
        // TODO: Add password hashing in future implementation
        const user = db.prepare(`SELECT * FROM users WHERE username = ? AND password = ?`).get(username, password);
        
        if (user) {
            currentUser = user;
            // If loadUserFavorites exists (from players.js), call it
            if (typeof loadUserFavorites === 'function') {
                loadUserFavorites();
            }
            return { success: true, user: { id: user.id, username: user.username, email: user.email } };
        } else {
            return { success: false, error: 'Invalid username or password' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout user
function logoutUser() {
    currentUser = null;
    // If userFavorites exists (from players.js), reset it
    if (typeof userFavorites !== 'undefined') {
        userFavorites = [];
    }
    return { success: true };
}

// Initialize user profile dropdown
function initializeUserDropdown() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}

// Initialize auth modal functionality
function initializeAuthModal() {
    // Get modal elements
    const authModal = document.getElementById('authModal');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const closeModal = document.querySelector('.close-modal');
    
    // If modal elements don't exist, create them
    if (!authModal) {
        createAuthModal();
        return; // After creating, we'll initialize on next load
    }
    
    // Open modal when login/register links are clicked
    document.querySelectorAll('a[href="#login"], a[href="#register"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
            
            // Switch to appropriate tab
            if (e.target.getAttribute('href') === '#register' && registerTab) {
                registerTab.click();
            } else if (loginTab) {
                loginTab.click();
            }
        });
    });
    
    // Close modal when clicking the close button or outside the modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // Tab switching functionality
    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });
        
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
    
    // Form submission handling
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = loginUser(username, password);
            if (result.success) {
                alert('Login successful!');
                authModal.style.display = 'none';
                updateUIForLoggedInUser();
            } else {
                alert(`Login failed: ${result.error}`);
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const email = document.getElementById('registerEmail').value;
            
            const result = registerUser(username, password, email);
            if (result.success) {
                alert('Registration successful! Please login.');
                loginTab.click(); // Switch to login tab
            } else {
                alert(`Registration failed: ${result.error}`);
            }
        });
    }
}

// Create auth modal if it doesn't exist
function createAuthModal() {
    const modalHTML = `
    <div id="authModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            
            <div class="auth-tabs">
                <button id="loginTab" class="auth-tab active">Login</button>
                <button id="registerTab" class="auth-tab">Register</button>
            </div>
            
            <div id="loginForm" class="auth-form active">
                <h3>Login to Your Account</h3>
                <div class="form-group">
                    <label for="loginUsername">Username</label>
                    <input type="text" id="loginUsername" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="auth-submit">Login</button>
            </div>
            
            <div id="registerForm" class="auth-form">
                <h3>Create an Account</h3>
                <div class="form-group">
                    <label for="registerUsername">Username</label>
                    <input type="text" id="registerUsername" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" required>
                </div>
                <button type="submit" class="auth-submit">Register</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize after creating
    setTimeout(initializeAuthModal, 100);
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownContent = document.getElementById('userDropdownContent');
    
    if (userProfileBtn && userDropdownContent && currentUser) {
        userProfileBtn.innerHTML = `<span>${currentUser.username.charAt(0).toUpperCase()}</span>`;
        userProfileBtn.classList.add('logged-in');
        
        userDropdownContent.innerHTML = `
            <a href="#profile"><i class="fas fa-user"></i> Profile</a>
            <a href="#favorites"><i class="fas fa-heart"></i> Favorites</a>
            <a href="#settings"><i class="fas fa-cog"></i> Settings</a>
            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
        `;
        
        // Re-attach logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
                updateUIForLoggedOutUser();
            });
        }
        
        // If renderPlayerCards exists (from players.js), refresh player cards to show favorites
        if (typeof renderPlayerCards === 'function') {
            renderPlayerCards();
        }
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdownContent = document.getElementById('userDropdownContent');
    
    if (userProfileBtn && userDropdownContent) {
        userProfileBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userProfileBtn.classList.remove('logged-in');
        
        userDropdownContent.innerHTML = `
            <a href="#login"><i class="fas fa-sign-in-alt"></i> Login</a>
            <a href="#register"><i class="fas fa-user-plus"></i> Sign Up</a>
        `;
        
        // If renderPlayerCards exists (from players.js), refresh player cards to remove favorites
        if (typeof renderPlayerCards === 'function') {
            renderPlayerCards();
        }
    }
}

// Initialize user authentication
function initializeUserAuth() {
    if (typeof db !== 'undefined') {
        initializeUserAuth();
        initializeUserDropdown();
        initializeAuthModal();
    } else {
        console.error('Database not available');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if database is initialized in services.js
    if (typeof initDatabase === 'function') {
        initDatabase().then(() => {
            initializeUserAuth();
        });
    } else {
        // If services.js already initialized the database
        setTimeout(initializeUserAuth, 500); // Give a small delay to ensure DB is ready
    }
});
