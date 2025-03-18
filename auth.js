// Client-side authentication handling
class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form handling
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form handling
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            
            // Password strength checker
            const passwordInput = signupForm.querySelector('#password');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
            }
        }

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const remember = form.remember?.checked;

        try {
            form.querySelector('button[type="submit"]').classList.add('loading');
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));
            
            if (user) {
                this.currentUser = { ...user, password: undefined };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                }
                this.showNotification('Login successful!', 'success');
                window.location.href = 'index.html';
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            form.querySelector('button[type="submit"]').classList.remove('loading');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const fullname = form.fullname.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form['confirm-password'].value;
        const terms = form.terms.checked;

        try {
            // Validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (!terms) {
                throw new Error('Please accept the terms and conditions');
            }
            if (this.users.some(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            form.querySelector('button[type="submit"]').classList.add('loading');
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create new user
            const newUser = {
                id: Date.now(),
                fullname,
                email,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            };

            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));

            this.showNotification('Account created successfully!', 'success');
            window.location.href = 'login.html';
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            form.querySelector('button[type="submit"]').classList.remove('loading');
        }
    }

    checkPasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text span');
        
        if (!strengthMeter || !strengthText) return;

        const weak = /[a-z]/.test(password) || /[A-Z]/.test(password) || /[0-9]/.test(password);
        const medium = /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
        const strong = medium && password.length >= 8 && /[!@#$%^&*]/.test(password);

        let strength = 'weak';
        if (strong) strength = 'strong';
        else if (medium) strength = 'medium';

        strengthMeter.dataset.strength = strength;
        strengthText.textContent = strength;
    }

    togglePasswordVisibility(e) {
        const button = e.target;
        const input = button.parentElement.querySelector('input');
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        button.textContent = type === 'password' ? '👁️' : '🔒';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        });
    }

    hashPassword(password) {
        // In a real app, use proper password hashing
        return btoa(password);
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Initialize authentication
const auth = new Auth();

// Check if user is logged in on protected pages
if (!window.location.pathname.includes('login.html') && 
    !window.location.pathname.includes('signup.html')) {
    if (!auth.currentUser) {
        window.location.href = 'login.html';
    }
}
